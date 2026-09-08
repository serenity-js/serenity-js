/*
 * Implementation contracts: these tests verify that ANSI SGR escape sequences
 * are correctly converted to <span class="ansi-*"> elements with the right CSS
 * class names and structure. This is a rendering contract — not user-observable
 * behaviour in the interaction object sense.
 */
import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, expect, it } from '../../../spec/app/story-fixtures.js';

const baseScenarioFields = {
    category: 'Suite',
    outcome: 'FAILURE',
    duration: 200,
    startedAt: '2024-06-15T14:30:00.000Z',
    source: { path: 'spec/ansi.spec.ts', line: 5 },
    tags: [],
};

const scenarioDetailStory = 'components/scenarios/ScenarioDetailView/Default';
const scenarioDetailId = 'spec/ansi.spec.ts:5';

function scenarioWithError(error: { name: string; message: string; stack: string }, overrides: Record<string, unknown> = {}) {
    const data = minimalData({
        scenarios: [{
            ...baseScenarioFields,
            name: 'Error test',
            activities: [],
            executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
            error,
            ...overrides,
        }],
    });
    return { ...data, scenarioId: scenarioDetailId };
}

function scenarioWithAnsiError() {
    return scenarioWithError(
        {
            name: 'AssertionError',
            message: '\u001b[32mExpected number: 2\u001b[39m\n\u001b[31mReceived number: 0\u001b[39m',
            stack: 'at Object.<anonymous> (spec/ansi.spec.ts:5:24)',
        },
        {
            name: 'Coloured error test',
            activities: [
                { name: 'Ensure value equals expected', outcome: 'FAILURE', duration: 50, children: [] },
            ],
        },
    );
}

describe('ANSI colour rendering in error messages', () => {

    it('renders ANSI green text with a green colour class', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithAnsiError());

        const greenSpan = page.locator('.error-message .ansi-green');
        await expect(greenSpan).toBeVisible();
        await expect(greenSpan).toHaveText('Expected number: 2');
    });

    it('renders ANSI red text with a red colour class', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithAnsiError());

        const redSpan = page.locator('.error-message .ansi-red');
        await expect(redSpan).toBeVisible();
        await expect(redSpan).toHaveText('Received number: 0');
    });

    it('strips ANSI escape sequences from plain text portions', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithAnsiError());

        const messageText = await page.locator('.error-message').textContent();
        expect(messageText).not.toContain('\u001b');
        expect(messageText).not.toContain('[32m');
        expect(messageText).not.toContain('[31m');
    });

    it('renders ANSI colours in the error stack trace', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithError(
            {
                name: 'Error',
                message: 'simple message',
                stack: '\u001b[2mat Object.<anonymous> (spec/ansi.spec.ts:5:24)\u001b[22m',
            },
            { name: 'Stack colour test' },
        ));

        const dimSpan = page.locator('.error-stack .ansi-dim');
        await expect(dimSpan).toBeVisible();
        await expect(dimSpan).toContainText('at Object.<anonymous>');
    });

    it('handles bold ANSI codes', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithError(
            {
                name: 'Error',
                message: '\u001b[1mBold text\u001b[22m normal text',
                stack: '',
            },
            { name: 'Bold test', duration: 100 },
        ));

        const boldSpan = page.locator('.error-message .ansi-bold');
        await expect(boldSpan).toBeVisible();
        await expect(boldSpan).toHaveText('Bold text');
    });

    it('passes through text without ANSI codes unchanged', async ({ mount, page }) => {
        await mount(scenarioDetailStory, scenarioWithError(
            {
                name: 'Error',
                message: 'Plain error with no colour codes',
                stack: 'at file.ts:1:1',
            },
            { name: 'No ANSI test', duration: 100 },
        ));

        await expect(page.locator('.error-message')).toHaveText('Plain error with no colour codes');
        await expect(page.locator('.error-stack')).toContainText('at file.ts:1:1');
    });
});
