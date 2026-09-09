import { Ensure, equals, includes, not } from '@serenity-js/assertions';
import { describe, expect, it } from '@serenity-js/playwright-test';

import { HistoricalBanner } from '../../../src/serenity/common/HistoricalBanner.serenity.js';

describe('HistoricalBanner', () => {

    describe('user-observable behaviour', () => {

        it('renders the banner with label and runLabel', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42 — 15 Jun 2024',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.text(), includes('Viewing results from:')),
                Ensure.that(view.text(), includes('Run #42 — 15 Jun 2024')),
            );
        });

        it('renders the runLabel in a strong element', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42 — 15 Jun 2024',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.runLabel(), equals('Run #42 — 15 Jun 2024')),
            );
        });

        it('renders subtitle when provided', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                subtitle: '— 2m 30s',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.subtitle(), includes('— 2m 30s')),
            );
        });

        it('does not render subtitle when not provided', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing errors from:',
                runLabel: 'Run #42',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.subtitle(), not(includes('—'))),
            );
        });

        it('renders "show latest" link with correct text', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.showLatestLinkText(), equals('show latest')),
            );
        });

        it('renders "show latest" link with href when showLatestHref provided', async ({ story, actor }) => {
            const view = story('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                showLatestHref: '#/tests',
            }).as(HistoricalBanner);

            await actor.attemptsTo(
                Ensure.that(view.showLatestLinkHref(), equals('#/tests')),
            );
        });
    });

    describe('implementation contracts', () => {

        it('invokes onShowLatest callback when link is clicked', async ({ mount, page }) => {
            await mount('components/common/HistoricalBanner/WithCallbacks', {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
            });

            const link = page.locator('.historical-banner a.link-underline');
            await expect(link).not.toHaveAttribute('href');
            await link.click();

            const clicked = page.locator('[data-testid="show-latest-clicked"]');
            await expect(clicked).toHaveValue('true');
        });

        it('has the correct CSS class for styling', async ({ mount, page }) => {
            await mount('components/common/HistoricalBanner/Default', {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
            });

            await expect(page.locator('.historical-banner')).toBeVisible();
            await expect(page.locator('.historical-banner')).toHaveCount(1);
        });
    });
});
