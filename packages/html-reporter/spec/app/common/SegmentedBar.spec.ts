import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';

import { SegmentedBar } from '../../../src/serenity/common/SegmentedBar.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('SegmentedBar', () => {

    describe('user-observable behaviour', () => {

        it('renders nothing when all outcomes are zero', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                Ensure.that(bar, not(isPresent())),
            );
        });

        it('renders a bar with correct aria-label describing the outcome counts', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                Ensure.that(bar.accessibleLabel(), equals('5 passed, 2 failed, 1 skipped')),
            );
        });

        it('combines failed, error, and compromised into one failure segment', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 4, failed: 1, pending: 0, skipped: 0, compromised: 1, error: 1 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                // 4 passed + 3 failed (1+1+1) = 7 total
                Ensure.that(bar.accessibleLabel(), equals('4 passed, 3 failed, 0 skipped')),
            );
        });

        it('combines pending and skipped into one skipped segment', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 2, failed: 0, pending: 3, skipped: 1, compromised: 0, error: 0 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                Ensure.that(bar.accessibleLabel(), equals('2 passed, 0 failed, 4 skipped')),
            );
        });

        it('shows only a passed segment when there are no failures or skips', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 10, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                Ensure.that(bar.segmentCount(), equals(1)),
            );
        });

        it('includes a visually-hidden text summary for screen readers', async ({ mount, actor }) => {
            const bar = await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
                interactionObject: SegmentedBar,
            });

            await actor.attemptsTo(
                Ensure.that(bar.accessibleText(), equals('5 passed, 2 failed, 1 skipped')),
            );
        });
    });

    // Visual rendering contract tests: These verify CSS dimensions, colours, and proportional
    // widths that are not user-observable in the interaction object sense. They test the visual
    // rendering contract and remain as raw Playwright assertions.
    describe('visual rendering contract', () => {

        it('uses default 6px height without a className', async ({ mount, page }) => {
            await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
            });

            const bar = page.locator('[role="img"]');
            await expect(bar).toHaveCSS('height', '6px');
        });

        it('uses 10px height when className is req-detail-outcome-bar', async ({ mount, page }) => {
            await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, className: 'req-detail-outcome-bar' },
                data: minimalData(),
            });

            const bar = page.locator('[role="img"]');
            await expect(bar).toHaveCSS('height', '10px');
        });

        it('renders proportional segment widths', async ({ mount, page }) => {
            await mount({
                component: 'SegmentedBar',
                importPath: './components/common/charts/SegmentedBar',
                props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                data: minimalData(),
            });

            const bar = page.locator('[role="img"]');
            const segments = bar.locator('[aria-hidden="true"]');
            await expect(segments).toHaveCount(2);
            // 3 passed out of 4 total = 75%
            await expect(segments.first()).toHaveAttribute('style', /width:\s*75%/);
            // 1 failed out of 4 total = 25%
            await expect(segments.nth(1)).toHaveAttribute('style', /width:\s*25%/);
        });
    });
});
