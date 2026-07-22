import { contain, Ensure, equals, includes, not } from '@serenity-js/assertions';
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
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
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
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
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
                    { type: 'feature', name: 'Login', scenarioCount: 4, passed: 3, failed: 1, skipped: 0 },
                ],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.tagCardText('Login'), includes('75%')),
            Ensure.that(view.tagCardText('Login'), includes('4 scenarios')),
        );
    });

    it('navigates to filtered scenarios using @type:"name" format on tag click', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: '__onNavigate__' },
            data: minimalData({
                tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2, failed: 0, skipped: 0 }],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            view.selectTag('Login'),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
            Ensure.that(LastScriptExecution.result<string>(), includes('@feature:Login')),
        );
    });

    it('navigates using shorthand @name format for tags of type "tag"', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'TagsView',
            importPath: './components/tags/TagsView',
            props: { onNavigate: '__onNavigate__' },
            data: minimalData({
                tags: [{ type: 'tag', name: 'smoke', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 }],
            }),
            interactionObject: TagsView,
        });

        await actor.attemptsTo(
            view.selectTag('smoke'),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
            Ensure.that(LastScriptExecution.result<string>(), includes('@smoke')),
        );
    });

    describe('search', () => {

        it('filters tag cards by name', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.find('Login'),
                Ensure.that(view.tagCount(), equals(1)),
                Ensure.that(view.tagNames(), equals(['Login'])),
            );
        });

        it('is case-insensitive', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.find('login'),
                Ensure.that(view.tagCount(), equals(1)),
                Ensure.that(view.tagNames(), equals(['Login'])),
            );
        });

        it('shows a result count when filtering reduces the list', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.find('Login'),
                Ensure.that(view.resultCountText(), includes('1 of 3')),
            );
        });
    });

    describe('outcome filter', () => {

        it('shows all tags by default', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                Ensure.that(view.tagCount(), equals(3)),
            );
        });

        it('filters to show only tags with 100% pass rate when Passed is selected', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.selectFilter('Passed'),
                Ensure.that(view.tagCount(), equals(2)),
                Ensure.that(view.tagNames(), contain('Login')),
                Ensure.that(view.tagNames(), contain('smoke')),
                Ensure.that(view.tagNames(), not(contain('Checkout'))),
            );
        });

        it('filters to show only tags with failures when Failed is selected', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.selectFilter('Failed'),
                Ensure.that(view.tagCount(), equals(1)),
                Ensure.that(view.tagNames(), equals(['Checkout'])),
            );
        });

        it('combines search and outcome filter', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TagsView',
                importPath: './components/tags/TagsView',
                props: { onNavigate: () => {} },
                data: minimalData({
                    tags: [
                        { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3, failed: 0, skipped: 0 },
                        { type: 'feature', name: 'Login Mobile', scenarioCount: 2, passed: 1, failed: 1, skipped: 0 },
                        { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4, failed: 0, skipped: 0 },
                    ],
                }),
                interactionObject: TagsView,
            });

            await actor.attemptsTo(
                view.find('Login'),
                view.selectFilter('Failed'),
                Ensure.that(view.tagCount(), equals(1)),
                Ensure.that(view.tagNames(), equals(['Login Mobile'])),
            );
        });
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
                    { type: 'feature', name: 'High', scenarioCount: 10, passed: 9, failed: 1, skipped: 0 },
                    { type: 'feature', name: 'Low', scenarioCount: 10, passed: 3, failed: 7, skipped: 0 },
                ],
            }),
        });

        const highCard = page.locator('.tag-card', { hasText: 'High' });
        const lowCard = page.locator('.tag-card', { hasText: 'Low' });
        await expect(highCard).toContainText('90%');
        await expect(lowCard).toContainText('30%');
    });
});
