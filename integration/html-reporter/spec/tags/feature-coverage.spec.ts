import { contain, Ensure, equals, includes, isGreaterThan, not } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Tags', () => {

    describe('Feature Coverage', () => {

        it('navigates to filtered scenarios using @type:name format', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.selectTag('Todo List'),

                Ensure.that(Page.current().url().href, includes('#/tests')),
                Ensure.that(Page.current().url().href, includes(encodeURIComponent('@feature:"Todo List"'))),
            );
        });

        it('uses shorthand @name format for tags of type "tag"', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.find('wip'),

                tagsView.selectTag('wip'),

                Ensure.that(Page.current().url().href, includes(encodeURIComponent('@wip'))),
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

                Ensure.that(tagsView.tagCount(), equals(0)),
            );
        });
    });
});
