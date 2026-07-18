import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';

import { RunSelector } from '../../../src/serenity/common/RunSelector.serenity.js';
import { beforeEach, describe, it, expect } from '../fixtures.js';

const sampleHistory = [
    {
        timestamp: '2024-06-14T10:00:00.000Z',
        label: '42',
        duration: 120000,
        outcomes: { passed: 8, failed: 2, error: 0, compromised: 0, pending: 0, skipped: 0 },
    },
    {
        timestamp: '2024-06-15T14:30:00.000Z',
        label: '43',
        duration: 90000,
        outcomes: { passed: 9, failed: 1, error: 0, compromised: 0, pending: 0, skipped: 0 },
    },
];

describe('RunSelector', () => {

    beforeEach(async ({ page }) => {
        await page.exposeFunction('__noop', () => { /* noop */ });
    });

    it('renders a dropdown with run options', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-15T14:30:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: false,
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.selectedRun(), equals('2024-06-15T14:30:00.000Z')),
        );
    });

    it('selects the active run', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-14T10:00:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: true,
                showLatestHref: '#/tests',
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.selectedRun(), equals('2024-06-14T10:00:00.000Z')),
        );
    });

    it('does not show "show latest" link when viewing latest run', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-15T14:30:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: false,
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestIsPresent(), isFalse()),
        );
    });

    it('shows "show latest" link when viewing a historical run', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-14T10:00:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: true,
                showLatestHref: '#/tests',
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestLinkText(), equals('show latest')),
        );
    });

    it('"show latest" link has correct href', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-14T10:00:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: true,
                showLatestHref: '#/tests',
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestLinkHref(), equals('#/tests')),
        );
    });

    it('indicates historical state', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-14T10:00:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: true,
                showLatestHref: '#/tests',
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.isHistorical(), isTrue()),
        );
    });

    it('indicates non-historical state', async ({ mount, actor }) => {
        const runSelector = await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-15T14:30:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: false,
            },
            interactionObject: RunSelector,
        });

        await actor.attemptsTo(
            Ensure.that(runSelector.isHistorical(), isFalse()),
        );
    });

    /* Raw Playwright tests — verify implementation contracts (CSS classes, ARIA attributes) */
    describe('implementation contracts', () => {

        it('applies historical CSS class when isHistorical is true', async ({ mount, page }) => {
            await mount({
                component: 'RunSelector',
                importPath: './components/common/RunSelector',
                props: {
                    activeTimestamp: '2024-06-14T10:00:00.000Z',
                    history: sampleHistory,
                    onRunChange: '__noop',
                    isHistorical: true,
                    showLatestHref: '#/tests',
                },
                interactionObject: RunSelector,
            });

            const wrapper = page.locator('.run-selector-row');
            await expect(wrapper).toHaveClass(/run-selector-row--historical/);

            const select = page.locator('select');
            await expect(select).toHaveClass(/run-select--historical/);
        });

        it('does not apply historical CSS class when isHistorical is false', async ({ mount, page }) => {
            await mount({
                component: 'RunSelector',
                importPath: './components/common/RunSelector',
                props: {
                    activeTimestamp: '2024-06-15T14:30:00.000Z',
                    history: sampleHistory,
                    onRunChange: '__noop',
                    isHistorical: false,
                },
                interactionObject: RunSelector,
            });

            const wrapper = page.locator('.run-selector-row');
            await expect(wrapper).not.toHaveClass(/run-selector-row--historical/);

            const select = page.locator('select');
            await expect(select).not.toHaveClass(/run-select--historical/);
        });

        it('updates aria-label when historical', async ({ mount, page }) => {
            await mount({
                component: 'RunSelector',
                importPath: './components/common/RunSelector',
                props: {
                    activeTimestamp: '2024-06-14T10:00:00.000Z',
                    history: sampleHistory,
                    onRunChange: '__noop',
                    isHistorical: true,
                    showLatestHref: '#/tests',
                },
                interactionObject: RunSelector,
            });

            const select = page.locator('select');
            await expect(select).toHaveAttribute('aria-label', 'Select test run (historical)');
        });
    });

    it('invokes onRunChange when a different option is selected', async ({ mount, actor, page }) => {
        const receivedValues: string[] = [];
        await page.exposeFunction('__onRunChange__', (value: string) => { receivedValues.push(value); });

        await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-15T14:30:00.000Z',
                history: sampleHistory,
                onRunChange: '__onRunChange__',
                isHistorical: false,
            },
            interactionObject: RunSelector,
        });

        const select = page.locator('select');
        await select.selectOption('2024-06-14T10:00:00.000Z');

        expect(receivedValues.length).toBeGreaterThan(0);
    });

    it('invokes onShowLatest callback when link is clicked', async ({ mount, page }) => {
        const callCount: number[] = [];
        await page.exposeFunction('__onShowLatest__', () => { callCount.push(1); });

        await mount({
            component: 'RunSelector',
            importPath: './components/common/RunSelector',
            props: {
                activeTimestamp: '2024-06-14T10:00:00.000Z',
                history: sampleHistory,
                onRunChange: '__noop',
                isHistorical: true,
                onShowLatest: '__onShowLatest__',
            },
            interactionObject: RunSelector,
        });

        const link = page.locator('.show-latest-link');
        await link.click();

        expect(callCount.length).toBeGreaterThan(0);
    });
});
