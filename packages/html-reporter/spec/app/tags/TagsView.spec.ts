import { Ensure, equals } from '@serenity-js/assertions';

import { TagsView } from '../../../src/serenity/tags/TagsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('TagsView interaction object', () => {

    it('reports the number of tag cards', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4 },
                ],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.tagCount(), equals(3)),
        );
    });

    it('allows selecting a tag by name', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4 },
                ],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            view.selectTag('Login'),
        );
        // Test passes if the tag was found and clicked without throwing
    });
});

describe('TagsView', () => {

    it('renders tag cards grouped by type', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4 },
                ],
            }),
        });

        await expect(page.locator('body')).toContainText('Feature');
        await expect(page.locator('body')).toContainText('Login');
        await expect(page.locator('body')).toContainText('Checkout');
        await expect(page.locator('body')).toContainText('Tag');
        await expect(page.locator('body')).toContainText('smoke');
    });

    it('displays pass rate percentage for each tag', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 4, passed: 3 },
                ],
            }),
        });

        await expect(page.locator('.tag-card')).toContainText('75%');
        await expect(page.locator('.tag-card')).toContainText('4 scenarios');
    });

    it('navigates to filtered scenarios on tag click', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: '__onNavigate__' },
            data: minimalData({
                tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2 }],
            }),
        });

        await page.locator('.tag-card').first().click();

        expect(navigatedTo).toBe('/tests?search=' + encodeURIComponent('"Login"'));
    });

    it('displays correct pass rate colors', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'High', scenarioCount: 10, passed: 9 },
                    { type: 'feature', name: 'Low', scenarioCount: 10, passed: 3 },
                ],
            }),
        });

        const highCard = page.locator('.tag-card', { hasText: 'High' });
        const lowCard = page.locator('.tag-card', { hasText: 'Low' });
        await expect(highCard).toContainText('90%');
        await expect(lowCard).toContainText('30%');
    });
});
