import { containItemsWhereEachItem, Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { TODO_ITEMS } from './test-data';
import { outstandingItemsCount, persistedItemCalled, startWithAListContaining, startWithAnEmptyList } from './todo-list-app/TodoApp';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding, markAsCompleted, markAsOutstanding, recordItem } from './todo-list-app/TodoItem';
import { itemCalled, items } from './todo-list-app/TodoList';

describe('Recording items', () => {

    describe('Todo List App', () => {

        it('should allow me to mark items as complete', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(TODO_ITEMS[0], TODO_ITEMS[1]),

                Ensure.that(
                    items(),
                    containItemsWhereEachItem(isDisplayedAsOutstanding()),
                ),

                markAsCompleted(itemCalled(TODO_ITEMS[0])),
                Ensure.that(items().nth(0), isDisplayedAsCompleted()),

                markAsCompleted(itemCalled(TODO_ITEMS[1])),
                Ensure.that(items().nth(1), isDisplayedAsCompleted()),
            );
        });

        it('should allow me to un-mark items as complete', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(TODO_ITEMS[0], TODO_ITEMS[1]),

                markAsCompleted(itemCalled(TODO_ITEMS[0])),
                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).completed, equals(true)),

                markAsOutstanding(itemCalled(TODO_ITEMS[0])),
                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).completed, equals(false)),
            );
        });

        it('should display the current number of outstanding todo items', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(TODO_ITEMS[0]),
                Ensure.that(outstandingItemsCount(), equals(1)),

                recordItem(TODO_ITEMS[1]),
                Ensure.that(outstandingItemsCount(), equals(2)),
            );
        });
    });
});
