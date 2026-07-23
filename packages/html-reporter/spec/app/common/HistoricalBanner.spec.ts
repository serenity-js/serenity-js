import { Ensure, equals, includes, not } from '@serenity-js/assertions';

import { HistoricalBanner } from '../../../src/serenity/common/HistoricalBanner.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('HistoricalBanner', () => {

    describe('user-observable behaviour', () => {

        it('renders the banner with label and runLabel', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42 — 15 Jun 2024',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.text(), includes('Viewing results from:')),
                Ensure.that(view.text(), includes('Run #42 — 15 Jun 2024')),
            );
        });

        it('renders the runLabel in a strong element', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42 — 15 Jun 2024',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.runLabel(), equals('Run #42 — 15 Jun 2024')),
            );
        });

        it('renders subtitle when provided', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42',
                    subtitle: '— 2m 30s',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.subtitle(), includes('— 2m 30s')),
            );
        });

        it('does not render subtitle when not provided', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing errors from:',
                    runLabel: 'Run #42',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.subtitle(), not(includes('—'))),
            );
        });

        it('renders "show latest" link with correct text', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.showLatestLinkText(), equals('show latest')),
            );
        });

        it('renders "show latest" link with href when showLatestHref provided', async ({ mount, actor }) => {
            const view = await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42',
                    showLatestHref: '#/tests',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
                interactionObject: HistoricalBanner,
            });

            await actor.attemptsTo(
                Ensure.that(view.showLatestLinkHref(), equals('#/tests')),
            );
        });
    });

    // Implementation contract tests: These verify callback wiring and CSS class presence
    // that are not user-observable behaviour. They remain as raw Playwright assertions.
    describe('implementation contracts', () => {

        it('invokes onShowLatest callback when link is clicked', async ({ mount, page }) => {
            let clicked = false;
            await page.exposeFunction('__onShowLatest__', () => { clicked = true; });

            await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42',
                    onShowLatest: '__onShowLatest__',
                },
                data: minimalData(),
                dataAsProps: false,
            });

            const link = page.locator('.historical-banner a.link-underline');
            await expect(link).not.toHaveAttribute('href');
            await link.click();
            expect(clicked).toBe(true);
        });

        it('has the correct CSS class for styling', async ({ mount, page }) => {
            await mount({
                component: 'HistoricalBanner',
                importPath: './components/common/HistoricalBanner',
                props: {
                    label: 'Viewing results from:',
                    runLabel: 'Run #42',
                    onShowLatest: '__noop',
                },
                data: minimalData(),
                dataAsProps: false,
            });

            await expect(page.locator('.historical-banner')).toBeVisible();
            await expect(page.locator('.historical-banner')).toHaveCount(1);
        });
    });
});
