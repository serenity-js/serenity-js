import { contain, Ensure, equals } from '@serenity-js/assertions';

import { ScenariosView } from '../../../src/serenity/scenarios/ScenariosView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

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

    it('@browser matches any scenario with a browser tag', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browser') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(3)),
        );
    });

    it('@browser:chromium matches scenarios with browser tag containing chromium', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browser:chromium') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browser:"chromium 149" matches scenarios with browser tag containing "chromium 149"', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browser:"chromium 149"') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browser:149 matches scenarios with browser tag containing 149 (substring)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browser:149') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('@browse does NOT match type browser (exact type match required)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browse') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(0)),
        );
    });

    it('multiple @ tokens are ANDed: @browser:chromium @project:mobile', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@browser:chromium @project:mobile') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            // Only "Checkout flow" has both browser:chromium AND project:mobile
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('mixed search: checkout @project:mobile matches text AND tag', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('checkout @project:mobile') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            // "Checkout flow" and "Cart checkout" have 'checkout' in name AND project:mobile tag
            Ensure.that(view.scenarioCount(), equals(2)),
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

    it('clicking a tag chip adds @type:value to the search field', async ({ mount, actor, page }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // Click the "mobile" project tag chip
        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('@project:mobile')),
        );
    });

    it('clicking a browser badge adds @browser:"value" to the search field', async ({ mount, actor, page }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // Click the chromium browser badge (value has spaces, so should be quoted)
        await page.locator('.badge-link').filter({ hasText: 'chromium' }).first().click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('@browser:"chromium 149.0.7827.55"')),
        );
    });

    it('clicking a tag chip that is already in search removes it (toggle off)', async ({ mount, actor, page }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@project:mobile') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // Click the "mobile" tag chip again to remove it
        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        await actor.attemptsTo(
            Ensure.that(view.searchInput.value(), equals('')),
        );
    });

    /* Implementation contract: verifies active class and aria-pressed. Kept as raw Playwright. */
    it('tag chip has active class when its token is in the search', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=' + encodeURIComponent('@project:mobile') },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // The "mobile" tag chip should be active
        const mobileChip = page.locator('.tag-chip').filter({ hasText: 'mobile' });
        await mobileChip.waitFor({ state: 'visible' });
        const classes = await mobileChip.getAttribute('class');
        const ariaPressed = await mobileChip.getAttribute('aria-pressed');

        expect(classes).toContain('active');
        expect(ariaPressed).toBe('true');
    });

    it('tag chip does not navigate to scenario detail when clicked', async ({ mount, page }) => {
        const navigatedPaths: string[] = [];
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedPaths.push(path); });

        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: '__onNavigate__', route: '/tests' },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // Click the "mobile" project tag chip
        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        // Should NOT have navigated to a scenario detail URL
        expect(navigatedPaths.filter(p => p.includes('/tests/'))).toHaveLength(0);
    });

    it('clicking tag chip filters the scenario list', async ({ mount, actor, page }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: dataWithTags,
            interactionObject: ScenariosView,
        });

        // Initially shows both scenarios
        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
        );

        // Click the "mobile" tag chip
        await page.locator('.tag-chip').filter({ hasText: 'mobile' }).click();

        // Should now show only the scenario with project:mobile
        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(1)),
            Ensure.that(view.scenarioNames(), contain('Checkout flow')),
        );
    });

    it('deduplicates tag chips with the same name but different types', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: minimalData({
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
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Capability test').tagChipLabels(), equals(['Capabilities', 'desktop'])),
        );
    });
});
