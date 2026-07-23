import { contain, Ensure, includes, isGreaterThan, not } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Tags', () => {

    describe('Feature Coverage', () => {

        it('navigates to filtered scenarios using @type:"name" format', async ({ actor, tagsView, scenariosView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.selectTag('Todo List'),

                Ensure.that(Page.current().url().href, includes('#/tests')),
                Ensure.that(Page.current().url().href, includes('search=')),
                Ensure.that(Page.current().url().href, includes('%40feature')),

                // The scenarios view shows only the matching scenarios
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
                Ensure.that(scenariosView.scenarioNames(), contain('Display should display items')),
            );
        });

        it('uses shorthand @name format for tags of type "tag"', async ({ actor, tagsView, scenariosView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.find('retried'),

                tagsView.selectTag('retried'),

                Ensure.that(Page.current().url().href, includes('#/tests')),
                Ensure.that(Page.current().url().href, includes(encodeURIComponent('@retried'))),

                // The scenarios view shows only the matching scenario
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
            );
        });

        it('double-quotes the tag token when the type contains a space', async ({ actor, tagsView, scenariosView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.find('Manual'),

                tagsView.selectTag('Manual'),

                // The URL should contain the double-quoted form: "@External Tests:Manual"
                Ensure.that(Page.current().url().href, includes('#/tests')),
                Ensure.that(Page.current().url().href, includes('%22%40External')),

                // The scenarios view shows only the manually-tagged scenarios
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
                Ensure.that(scenariosView.scenarioNames(), contain('should verify accessibility')),
                Ensure.that(scenariosView.scenarioNames(), contain('should verify print layout')),
            );
        });
    });

    describe('Search', () => {

        it('filters tag cards by name', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                Ensure.that(tagsView.tagCount(), isGreaterThan(1)),

                tagsView.find('Todo'),

                Ensure.that(tagsView.tagNames(), contain('Todo List')),
                Ensure.that(tagsView.tagNames(), not(contain('Authentication'))),
            );
        });

        it('is case-insensitive', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.find('todo'),

                Ensure.that(tagsView.tagNames(), contain('Todo List')),
            );
        });
    });

    describe('Outcome Filter', () => {

        it('shows only fully passing tags when Passed is selected', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.selectFilter('Passed'),

                Ensure.that(tagsView.tagCount(), isGreaterThan(0)),
            );
        });

        it('shows only tags with failures when Failed is selected', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.selectFilter('Failed'),

                // Some tags have failures (e.g., Checkout, Authentication features)
                Ensure.that(tagsView.tagCount(), isGreaterThan(0)),
            );
        });
    });
});
