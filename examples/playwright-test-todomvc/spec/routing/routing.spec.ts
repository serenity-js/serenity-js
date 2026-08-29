import { Ensure, equals } from '@serenity-js/assertions';
import { Navigate } from '@serenity-js/web';

import { beforeEach, describe, it } from '../fixtures';
import { testData } from '../test-data';

describe('Routing', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(...testData.items),
                Ensure.that(todoApp.persistedItemNames(), equals(testData.items)),
            );
        });

        it('should allow me to display active items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                todoApp.enableFilter('Active'),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[2],
                ])),
            );
        });

        it('should respect the back button', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                todoApp.enableFilter('All'),
                todoApp.enableFilter('Active'),
                todoApp.enableFilter('Completed'),

                Ensure.that(todoApp.todoList.items().count(), equals(1)),

                Navigate.back(),
                Ensure.that(todoApp.todoList.items().count(), equals(2)),

                Navigate.back(),
                Ensure.that(todoApp.todoList.items().count(), equals(3)),
            );
        });

        it('should allow me to display completed items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                todoApp.enableFilter('Completed'),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[1],
                ])),
            );
        });

        it('should allow me to display all items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                todoApp.enableFilter('Active'),
                todoApp.enableFilter('Completed'),
                todoApp.enableFilter('All'),

                Ensure.that(todoApp.todoList.itemNames().length, equals(3)),
            );
        });

        it('should highlight the currently applied filter', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                Ensure.that(todoApp.activeFilter(), equals('All')),

                todoApp.enableFilter('Active'),
                Ensure.that(todoApp.activeFilter(), equals('Active')),

                todoApp.enableFilter('Completed'),
                Ensure.that(todoApp.activeFilter(), equals('Completed')),
            );
        });
    });
});
