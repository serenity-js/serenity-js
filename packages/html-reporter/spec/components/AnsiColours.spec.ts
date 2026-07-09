import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

function scenarioWithAnsiError() {
    return minimalData({
        scenarios: [
            {
                name: 'Coloured error test',
                category: 'Suite',
                outcome: 'FAILURE',
                duration: 200,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/ansi.spec.ts', line: 5 },
                tags: [],
                activities: [
                    { name: 'Ensure value equals expected', outcome: 'FAILURE', duration: 50, children: [] },
                ],
                executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                error: {
                    name: 'AssertionError',
                    message: '\u001b[32mExpected number: 2\u001b[39m\n\u001b[31mReceived number: 0\u001b[39m',
                    stack: 'at Object.<anonymous> (spec/ansi.spec.ts:5:24)',
                },
            },
        ],
    });
}

describe('ANSI colour rendering in error messages', () => {

    it('renders ANSI green text with a green colour class', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: scenarioWithAnsiError(),
        });

        const greenSpan = page.locator('.error-message .ansi-green');
        await expect(greenSpan).toBeVisible();
        await expect(greenSpan).toHaveText('Expected number: 2');
    });

    it('renders ANSI red text with a red colour class', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: scenarioWithAnsiError(),
        });

        const redSpan = page.locator('.error-message .ansi-red');
        await expect(redSpan).toBeVisible();
        await expect(redSpan).toHaveText('Received number: 0');
    });

    it('strips ANSI escape sequences from plain text portions', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: scenarioWithAnsiError(),
        });

        // The raw escape codes should not appear in the rendered text
        const messageText = await page.locator('.error-message').textContent();
        expect(messageText).not.toContain('\u001b');
        expect(messageText).not.toContain('[32m');
        expect(messageText).not.toContain('[31m');
    });

    it('renders ANSI colours in the error stack trace', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Stack colour test',
                        category: 'Suite',
                        outcome: 'FAILURE',
                        duration: 200,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/ansi.spec.ts', line: 5 },
                        tags: [],
                        activities: [],
                        executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                        error: {
                            name: 'Error',
                            message: 'simple message',
                            stack: '\u001b[2mat Object.<anonymous> (spec/ansi.spec.ts:5:24)\u001b[22m',
                        },
                    },
                ],
            }),
        });

        const dimSpan = page.locator('.error-stack .ansi-dim');
        await expect(dimSpan).toBeVisible();
        await expect(dimSpan).toContainText('at Object.<anonymous>');
    });

    it('handles bold ANSI codes', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Bold test',
                        category: 'Suite',
                        outcome: 'FAILURE',
                        duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/ansi.spec.ts', line: 5 },
                        tags: [],
                        activities: [],
                        executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                        error: {
                            name: 'Error',
                            message: '\u001b[1mBold text\u001b[22m normal text',
                            stack: '',
                        },
                    },
                ],
            }),
        });

        const boldSpan = page.locator('.error-message .ansi-bold');
        await expect(boldSpan).toBeVisible();
        await expect(boldSpan).toHaveText('Bold text');
    });

    it('passes through text without ANSI codes unchanged', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/ansi.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'No ANSI test',
                        category: 'Suite',
                        outcome: 'FAILURE',
                        duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/ansi.spec.ts', line: 5 },
                        tags: [],
                        activities: [],
                        executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                        error: {
                            name: 'Error',
                            message: 'Plain error with no colour codes',
                            stack: 'at file.ts:1:1',
                        },
                    },
                ],
            }),
        });

        await expect(page.locator('.error-message')).toHaveText('Plain error with no colour codes');
        await expect(page.locator('.error-stack')).toContainText('at file.ts:1:1');
    });
});
