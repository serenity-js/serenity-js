import { contain, Ensure, equals } from '@serenity-js/assertions';
import { describe, expect, it } from '@serenity-js/playwright-test';

import { minimalData } from '../../../spec/app/data-factories.js';
import { ScenariosView } from '../../../src/serenity/scenarios/ScenariosView.serenity.js';

describe('ScenariosView tag search', () => {

    const dataWithTags = minimalData({
        scenarios: [
            {
                name: 'Checkout flow', category: 'E2E', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/checkout.spec.ts', line: 10 },
                tags: [
                    { type: 'browser', name: 'chromium 149.0.7827.55' },
                    { type: 'project', name: 'mobile' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Login page', category: 'Auth', outcome: 'SUCCESS', duration: 200,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/login.spec.ts', line: 5 },
                tags: [
                    { type: 'browser', name: 'firefox 128.0' },
                    { type: 'project', name: 'desktop' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Profile update', category: 'Settings', outcome: 'FAILURE', duration: 300,
                startedAt: '2024-06-15T14:30:00.200Z',
                source: { path: 'spec/profile.spec.ts', line: 15 },
                tags: [
                    { type: 'browser', name: 'chromium 149.0.7827.55' },
                    { type: 'project', name: 'desktop' },
                ],
                activities: [],
                executionHistory: [],
                error: { name: 'Error', message: 'Network timeout' },
            },
            {
                name: 'Cart checkout', category: 'E2E', outcome: 'SUCCESS', duration: 150,
                startedAt: '2024-06-15T14:30:00.300Z',
                source: { path: 'spec/cart.spec.ts', line: 20 },
                tags: [
                    { type: 'project', name: 'mobile' },
                ],
                activities: [],
                executionHistory: [],
            },
        ],
    });

    const dataWithTagTypeTags = minimalData({
        scenarios: [
            {
                name: 'Showcase scenario', category: 'Demo', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/showcase.spec.ts', line: 10 },
                tags: [
                    { type: 'tag', name: 'showcase' },
                    { type: 'browser', name: 'chromium 149.0.7827.55' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Smoke test', category: 'Smoke', outcome: 'SUCCESS', duration: 200,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/smoke.spec.ts', line: 5 },
                tags: [
                    { type: 'tag', name: 'smoke' },
                    { type: 'browser', name: 'firefox 128.0' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Feature scenario', category: 'Features', outcome: 'SUCCESS', duration: 300,
                startedAt: '2024-06-15T14:30:00.200Z',
                source: { path: 'spec/feature.spec.ts', line: 15 },
                tags: [
                    { type: 'feature', name: 'Payments' },
                    { type: 'tag', name: 'retried' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'No tags scenario', category: 'Other', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.300Z',
                source: { path: 'spec/plain.spec.ts', line: 20 },
                tags: [],
                activities: [],
                executionHistory: [],
            },
        ],
    });

    it('@browser matches any scenario with a browser tag', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browser') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(3)),
        );
    });

    it('@browser:chromium matches scenarios with browser tag containing chromium', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browser:chromium') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browser:"chromium 149" matches scenarios with browser tag containing "chromium 149"', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browser:"chromium 149"') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browser:149 matches scenarios with browser tag containing 149 (substring)', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browser:149') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browse does NOT match type browser (exact type match required)', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browse') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(0)),
        );
    });

    it('@showcase matches scenarios with a tag of type "tag" whose name contains "showcase"', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@showcase') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Showcase scenario')),
        );
    });

    it('@smoke matches scenarios with a tag of type "tag" whose name contains "smoke"', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@smoke') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Smoke test')),
        );
    });

    it('@retried matches scenarios with a tag of type "tag" whose name contains "retried"', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@retried') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Feature scenario')),
        );
    });

    it('@browser still matches any scenario with a browser tag (known type, not treated as @tag:browser)', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@browser') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@feature still matches any scenario with a feature tag (known type)', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@feature') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Feature scenario')),
        );
    });

    it('@tag:showcase also matches (explicit form equivalent to @showcase)', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTagTypeTags, route: '/tests?search=' + encodeURIComponent('@tag:showcase') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Showcase scenario')),
        );
    });

    it('multiple @ tokens are ANDed: @browser:chromium @project:mobile', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@browser:chromium @project:mobile') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('mixed search: checkout @project:mobile matches text AND tag', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('checkout @project:mobile') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('"@External Tests:Manual" matches scenarios with a tag whose type contains a space', async ({ story, actor }) => {
        const dataWithSpacedType = minimalData({
            scenarios: [
                {
                    name: 'Manual test A', category: 'Manual', outcome: 'PENDING', duration: 0,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/manual.spec.ts', line: 10 },
                    tags: [{ type: 'External Tests', name: 'Manual' }],
                    activities: [],
                    executionHistory: [],
                },
                {
                    name: 'Automated test B', category: 'E2E', outcome: 'SUCCESS', duration: 100,
                    startedAt: '2024-06-15T14:30:00.100Z',
                    source: { path: 'spec/auto.spec.ts', line: 5 },
                    tags: [{ type: 'feature', name: 'Login' }],
                    activities: [],
                    executionHistory: [],
                },
            ],
        });
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithSpacedType, route: '/tests?search=' + encodeURIComponent('"@External Tests:Manual"') }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Manual test A')),
        );
    });
});

describe('ScenariosView tag chip interaction', () => {

    const dataWithTags = minimalData({
        scenarios: [
            {
                name: 'Checkout flow', category: 'E2E', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/checkout.spec.ts', line: 10 },
                tags: [
                    { type: 'browser', name: 'chromium 149.0.7827.55' },
                    { type: 'project', name: 'mobile' },
                ],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Login page', category: 'Auth', outcome: 'SUCCESS', duration: 200,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/login.spec.ts', line: 5 },
                tags: [
                    { type: 'browser', name: 'firefox 128.0' },
                    { type: 'project', name: 'desktop' },
                ],
                activities: [],
                executionHistory: [],
            },
        ],
    });

    it('clicking a tag chip adds @type:value to the search field', async ({ story, actor, page }) => {
        const view = story('components/scenarios/ScenariosView/Default', dataWithTags).as(ScenariosView);

        await actor.answer(view);

        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('@project:mobile')),
        );
    });

    it('clicking a browser badge adds @browser:"value" to the search field', async ({ story, actor, page }) => {
        const view = story('components/scenarios/ScenariosView/Default', dataWithTags).as(ScenariosView);

        await actor.answer(view);

        await page.locator('.badge-link').filter({ hasText: 'chromium' }).first().click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('@browser:"chromium 149.0.7827.55"')),
        );
    });

    it('clicking a tag chip that is already in search removes it (toggle off)', async ({ story, actor, page }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...dataWithTags, route: '/tests?search=' + encodeURIComponent('@project:mobile') }).as(ScenariosView);

        await actor.answer(view);

        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('')),
        );
    });

    it('tag chip has active class when its token is in the search', async ({ mount, page }) => {
        await mount('components/scenarios/ScenariosView/Default', {
            ...dataWithTags,
            route: '/tests?search=' + encodeURIComponent('@project:mobile'),
        });

        const mobileChip = page.locator('.tag-chip').filter({ hasText: 'mobile' });
        await mobileChip.waitFor({ state: 'visible' });
        const classes = await mobileChip.getAttribute('class');
        const ariaPressed = await mobileChip.getAttribute('aria-pressed');

        expect(classes).toContain('active');
        expect(ariaPressed).toBe('true');
    });

    it('tag chip does not navigate to scenario detail when clicked', async ({ mount, page }) => {
        await mount('components/scenarios/ScenariosView/WithNavigation', {
            ...dataWithTags,
            route: '/tests',
        });

        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        const navigatedTo = page.locator('[data-testid="navigated-to"]');
        const navigatedValue = await navigatedTo.inputValue();
        // Should NOT have navigated to a scenario detail URL
        expect(navigatedValue.includes('/tests/')).toBe(false);
    });

    it('clicking tag chip filters the scenario list', async ({ story, actor, page }) => {
        const view = story('components/scenarios/ScenariosView/Default', dataWithTags).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );

        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Checkout flow')),
        );
    });

    it('deduplicates tag chips with the same name but different types', async ({ story, actor }) => {
        const view = story('components/scenarios/ScenariosView/Default', { ...minimalData({
            scenarios: [
                {
                    name: 'Capability test', category: 'Capabilities', outcome: 'SUCCESS', duration: 100,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/cap.spec.ts', line: 5 },
                    tags: [
                        { type: 'feature', name: 'Capabilities' },
                        { type: 'capability', name: 'Capabilities' },
                        { type: 'project', name: 'desktop' },
                    ],
                    activities: [],
                    executionHistory: [],
                },
            ],
        }) }).as(ScenariosView);

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Capability test').tagChipLabels(), equals(['Capabilities', 'desktop'])),
        );
    });

    it('clicking a tag-type chip adds @value shorthand to the search field', async ({ story, actor, page }) => {
        const showcaseData = minimalData({
            scenarios: [
                {
                    name: 'Showcase scenario', category: 'Demo', outcome: 'SUCCESS', duration: 100,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/showcase.spec.ts', line: 10 },
                    tags: [
                        { type: 'tag', name: 'showcase' },
                    ],
                    activities: [],
                    executionHistory: [],
                },
            ],
        });
        const view = story('components/scenarios/ScenariosView/Default', showcaseData).as(ScenariosView);

        await actor.answer(view);

        await page.locator('.tag-chip').filter({ hasText: 'showcase' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('@showcase')),
        );
    });

    it('clicking a tag-type chip that is already in search removes it (toggle off)', async ({ story, actor, page }) => {
        const showcaseData = minimalData({
            scenarios: [
                {
                    name: 'Showcase scenario', category: 'Demo', outcome: 'SUCCESS', duration: 100,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/showcase.spec.ts', line: 10 },
                    tags: [
                        { type: 'tag', name: 'showcase' },
                    ],
                    activities: [],
                    executionHistory: [],
                },
            ],
        });
        const view = story('components/scenarios/ScenariosView/Default', { ...showcaseData, route: '/tests?search=' + encodeURIComponent('@showcase') }).as(ScenariosView);

        await actor.answer(view);

        await page.locator('.tag-chip').filter({ hasText: 'showcase' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('')),
        );
    });
});
