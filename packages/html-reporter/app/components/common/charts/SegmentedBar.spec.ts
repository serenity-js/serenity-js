import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';

import { describe, expect, it } from '@serenity-js/playwright-test';
import { SegmentedBar } from '../../../../src/serenity/common/SegmentedBar.serenity.js';

describe('SegmentedBar', () => {

    describe('user-observable behaviour', () => {

        it('renders nothing when all outcomes are zero', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar, not(isPresent())),
            );
        });

        it('renders a bar with correct aria-label describing the outcome counts', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar.accessibleLabel(), equals('5 passed, 2 failed, 1 skipped')),
            );
        });

        it('combines failed, error, and compromised into one failure segment', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 4, failed: 1, pending: 0, skipped: 0, compromised: 1, error: 1 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar.accessibleLabel(), equals('4 passed, 3 failed, 0 skipped')),
            );
        });

        it('combines pending and skipped into one skipped segment', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 2, failed: 0, pending: 3, skipped: 1, compromised: 0, error: 0 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar.accessibleLabel(), equals('2 passed, 0 failed, 4 skipped')),
            );
        });

        it('shows only a passed segment when there are no failures or skips', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 10, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar.segmentCount(), equals(1)),
            );
        });

        it('includes a visually-hidden text summary for screen readers', async ({ story, actor }) => {
            const bar = story('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 },
            }).as(SegmentedBar);

            await actor.attemptsTo(
                Ensure.that(bar.accessibleText(), equals('5 passed, 2 failed, 1 skipped')),
            );
        });
    });

    describe('visual rendering contract', () => {

        it('uses default 6px height without a className', async ({ mount, page }) => {
            await mount('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const bar = page.locator('[role="img"]');
            await expect(bar).toHaveCSS('height', '6px');
        });

        it('uses 10px height when className is req-detail-outcome-bar', async ({ mount, page }) => {
            await mount('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                className: 'req-detail-outcome-bar',
            });

            const bar = page.locator('[role="img"]');
            await expect(bar).toHaveCSS('height', '10px');
        });

        it('renders proportional segment widths', async ({ mount, page }) => {
            await mount('components/common/charts/SegmentedBar/Default', {
                outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const bar = page.locator('[role="img"]');
            const segments = bar.locator('[aria-hidden="true"]');
            await expect(segments).toHaveCount(2);
            await expect(segments.first()).toHaveAttribute('style', /width:\s*75%/);
            await expect(segments.nth(1)).toHaveAttribute('style', /width:\s*25%/);
        });
    });
});
