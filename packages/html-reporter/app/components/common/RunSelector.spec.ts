import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { describe, expect, it } from '@serenity-js/playwright-test';

import { RunSelector } from '../../../src/serenity/common/RunSelector.serenity.js';

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

const latestRunProps = {
    activeTimestamp: '2024-06-15T14:30:00.000Z',
    history: sampleHistory,
    isHistorical: false,
};

const historicalRunProps = {
    activeTimestamp: '2024-06-14T10:00:00.000Z',
    history: sampleHistory,
    isHistorical: true,
    showLatestHref: '#/tests',
};

describe('RunSelector', () => {

    it('renders a dropdown with run options', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', latestRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.selectedRun(), equals('2024-06-15T14:30:00.000Z')),
        );
    });

    it('selects the active run', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', historicalRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.selectedRun(), equals('2024-06-14T10:00:00.000Z')),
        );
    });

    it('does not show "show latest" link when viewing latest run', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', latestRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestIsPresent(), isFalse()),
        );
    });

    it('shows "show latest" link when viewing a historical run', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', historicalRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestLinkText(), equals('show latest')),
        );
    });

    it('"show latest" link has correct href', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', historicalRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.showLatestLinkHref(), equals('#/tests')),
        );
    });

    it('indicates historical state', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', historicalRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.isHistorical(), isTrue()),
        );
    });

    it('indicates non-historical state', async ({ story, actor }) => {
        const runSelector = story('components/common/RunSelector/Default', latestRunProps).as(RunSelector);

        await actor.attemptsTo(
            Ensure.that(runSelector.isHistorical(), isFalse()),
        );
    });

    describe('implementation contracts', () => {

        it('applies historical CSS class when isHistorical is true', async ({ mount, page }) => {
            await mount('components/common/RunSelector/Default', historicalRunProps);

            const wrapper = page.locator('.run-selector-row');
            await expect(wrapper).toHaveClass(/run-selector-row--historical/);

            const select = page.locator('select');
            await expect(select).toHaveClass(/run-select--historical/);
        });

        it('does not apply historical CSS class when isHistorical is false', async ({ mount, page }) => {
            await mount('components/common/RunSelector/Default', latestRunProps);

            const wrapper = page.locator('.run-selector-row');
            await expect(wrapper).not.toHaveClass(/run-selector-row--historical/);

            const select = page.locator('select');
            await expect(select).not.toHaveClass(/run-select--historical/);
        });

        it('updates aria-label when historical', async ({ mount, page }) => {
            await mount('components/common/RunSelector/Default', historicalRunProps);

            const select = page.locator('select');
            await expect(select).toHaveAttribute('aria-label', 'Select test run (historical)');
        });
    });

    it('invokes onRunChange when a different option is selected', async ({ mount, page }) => {
        await mount('components/common/RunSelector/WithCallbacks', latestRunProps);

        const select = page.locator('select');
        await select.selectOption('2024-06-14T10:00:00.000Z');

        const selectedValue = page.locator('[data-testid="selected-value"]');
        await expect(selectedValue).toHaveValue('2024-06-14T10:00:00.000Z');
    });

    it('invokes onShowLatest callback when link is clicked', async ({ mount, page }) => {
        await mount('components/common/RunSelector/WithCallbacks', {
            activeTimestamp: '2024-06-14T10:00:00.000Z',
            history: sampleHistory,
            isHistorical: true,
        });

        const link = page.locator('.show-latest-link');
        await link.click();

        const clicked = page.locator('[data-testid="show-latest-clicked"]');
        await expect(clicked).toHaveValue('true');
    });
});
