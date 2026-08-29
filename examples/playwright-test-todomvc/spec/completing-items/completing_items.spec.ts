import { containItemsWhereEachItem, Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';

import { describe, it } from '../fixtures';
import { testData } from '../test-data';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding } from '../todo-list-app/TodoItem';

describe('Completing items', { tag: '@screenplay' }, () => {

    describe('Todo List App', () => {

        it('should allow me to mark items as complete', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(testData.items[0], testData.items[1]),

                Ensure.that(
                    todoApp.todoList.items(),
                    containItemsWhereEachItem(isDisplayedAsOutstanding()),
                ),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),
                Ensure.that(todoApp.todoList.items().nth(0), isDisplayedAsCompleted()),

                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),
                Ensure.that(todoApp.todoList.items().nth(1), isDisplayedAsCompleted()),
            );
        });

        it('should allow me to un-mark items as complete', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(testData.items[0], testData.items[1]),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),
                Ensure.that(todoApp.persistedItemCalled(testData.items[0]).completed, isTrue()),

                todoApp.todoList.itemCalled(testData.items[0]).markAsOutstanding(),
                Ensure.that(todoApp.persistedItemCalled(testData.items[0]).completed, isFalse()),
            );
        });

        it('should display the current number of outstanding todo items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),
                Ensure.that(todoApp.outstandingItemsCount(), equals(1)),

                todoApp.recordItem(testData.items[1]),
                Ensure.that(todoApp.outstandingItemsCount(), equals(2)),
            );
        });
    });
});
