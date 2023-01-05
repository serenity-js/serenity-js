import { Ensure, equals } from '@serenity-js/assertions';
import { beforeEach, describe, it } from '@serenity-js/playwright-test';
import { Navigate } from '@serenity-js/web';

import { TODO_ITEMS } from './test-data';
import { filterCalled, persistedItemNames, startWithAListContaining } from './todo-list-app/TodoApp';
import { hasCssClass, markAsCompleted } from './todo-list-app/TodoItem';
import { enableFilter, itemCalled, itemNames, items } from './todo-list-app/TodoList';

describe('Routing', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),
                Ensure.that(persistedItemNames(), equals(TODO_ITEMS)),
            );
        });

        it('should allow me to display active items', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),

                enableFilter('Active'),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    TODO_ITEMS[2],
                ])),
            );
        });

        it('should respect the back button', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),

                enableFilter('All'),
                enableFilter('Active'),
                enableFilter('Completed'),

                Ensure.that(items().count(), equals(1)),

                Navigate.back(),
                Ensure.that(items().count(), equals(2)),

                Navigate.back(),
                Ensure.that(items().count(), equals(3)),
            );
        });

        it('should allow me to display completed items', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),

                enableFilter('Completed'),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[1],
                ])),
            );
        });

        it('should allow me to display all items', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),

                enableFilter('Active'),
                enableFilter('Completed'),
                enableFilter('All'),

                Ensure.that(itemNames().length, equals(3)),
            );
        });

        it('should highlight the currently applied filter', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(filterCalled('All'), hasCssClass('selected')),

                enableFilter('Active'),
                Ensure.that(filterCalled('Active'), hasCssClass('selected')),

                enableFilter('Completed'),
                Ensure.that(filterCalled('Completed'), hasCssClass('selected')),
            );
        });
    });
});
