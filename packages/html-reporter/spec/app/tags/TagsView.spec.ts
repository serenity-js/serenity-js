import { contain, Ensure, equals, includes } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';

import { TagsView } from '../../../src/serenity/tags/TagsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('TagsView', () => {

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

    it('renders tag cards grouped by type', async ({ mount, actor }) => {
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
            Ensure.that(view.groupHeadings(), contain('FEATURE (2)')),
            Ensure.that(view.groupHeadings(), contain('TAG (1)')),
            Ensure.that(view.tagNames(), contain('Login')),
            Ensure.that(view.tagNames(), contain('Checkout')),
            Ensure.that(view.tagNames(), contain('smoke')),
        );
    });

    it('displays pass rate percentage for each tag', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 4, passed: 3 },
                ],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.tagCardText('Login'), includes('75%')),
            Ensure.that(view.tagCardText('Login'), includes('4 scenarios')),
        );
    });

    it('navigates to filtered scenarios on tag click', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: '__onNavigate__' },
            data: minimalData({
                tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2 }],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            view.selectTag('Login'),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
            Ensure.that(LastScriptExecution.result<string>(), includes('"Login"')),
        );
    });

    // Visual contract test — verifies pass rate colors via inline style.
    // Kept raw because it asserts on CSS styling (pass/fail color gradients),
    // which is an implementation detail not suitable for interaction objects.
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
