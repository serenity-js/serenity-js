import { contain, containItemsWhereEachItem, Ensure, equals, isFalse, isTrue, property } from '@serenity-js/assertions';
import { CssClasses } from '@serenity-js/web';

import { afterEach, beforeEach, describe, it } from '../fixtures';
import { testData } from '../test-data';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding } from '../todo-list-app/TodoItem';

describe('Bulk operations', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(...testData.items),
                Ensure.that(todoApp.persistedItems().length, equals(testData.items.length)),
            );
        });

        afterEach(async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                Ensure.that(todoApp.persistedItems().length, equals(testData.items.length)),
            );
        });

        it('should allow me to mark all items as completed @markAllCompleted', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.toggleAll(),

                // An assertion that uses a custom expectation isDisplayedAsCompleted
                Ensure.that(
                    todoApp.todoList.items(),
                    containItemsWhereEachItem(isDisplayedAsCompleted()),
                ),

                // Alternatively, the above assertion could be expressed using a forEach loop:
                todoApp.todoList.items().forEach(({ item, actor }) =>
                    actor.attemptsTo(
                        Ensure.that(CssClasses.of(item), contain('completed')),
                    )),

                Ensure.that(
                    todoApp.persistedItems(),
                    containItemsWhereEachItem(property('completed', isTrue())),
                ),
            );
        });

        it('should allow me to clear the complete state of all items @clearAll', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.toggleAll(),
                todoApp.toggleAll(),

                Ensure.that(
                    todoApp.todoList.items(),
                    containItemsWhereEachItem(isDisplayedAsOutstanding()),
                ),

                Ensure.that(
                    todoApp.persistedItems(),
                    containItemsWhereEachItem(property('completed', isFalse())),
                ),
            );
        });

        it('complete all checkbox should update state when items are completed / cleared @completeAll', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.toggleAll(),

                Ensure.that(todoApp.allAreCompleted(), isTrue()),

                todoApp.todoList.itemCalled(testData.items[0]).markAsOutstanding(),

                Ensure.that(todoApp.allAreCompleted(), isFalse()),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),

                Ensure.that(todoApp.allAreCompleted(), isTrue()),
            );
        });
    });

    describe('Clear completed button', () => {
        beforeEach(async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(...testData.items),
                Ensure.that(todoApp.persistedItemNames(), equals(testData.items)),
            );
        });

        it('should display the correct text', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),
                Ensure.that(todoApp.footer.clearCompletedButtonText(), equals('Clear completed')),
            );
        });

        it('should remove completed items when clicked', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),
                todoApp.clearCompleted(),

                Ensure.that(todoApp.todoList.items().count(), equals(2)),
                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[2],
                ])),
            );
        });

        it('should be hidden when there are no items that are completed', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                todoApp.clearCompleted(),

                Ensure.that(todoApp.canClearCompleted(), isFalse()),
            );
        });

        it.fixme('should mark test as manual @manual', async () => {});
    });
});
