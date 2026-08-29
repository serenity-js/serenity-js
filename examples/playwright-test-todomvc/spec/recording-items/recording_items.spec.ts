import { Ensure, equals, isFalse, isPresent, isTrue, not } from '@serenity-js/assertions';

import { describe, it } from '../fixtures';
import { testData } from '../test-data';

describe('Recording items', () => {

    describe('Todo List App', () => {

        it('should allow me to add todo items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                ])),

                todoApp.recordItem(testData.items[1]),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[1],
                ])),

                // note that `equals` and all the other expectations accept
                // either a static value or an Answerable
                Ensure.that(todoApp.persistedItemNames(), equals(todoApp.todoList.itemNames())),
            );
        });

        it('should clear text input field when an item is added', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),

                Ensure.that(todoApp.newTodoInputValue(), equals('')),

                Ensure.that(todoApp.persistedItemCalled(testData.items[0]).name, equals(testData.items[0])),
                Ensure.that(todoApp.persistedItemCalled(testData.items[0]).completed, isFalse()),
            );
        });

        it('should reflect the number of items left in the counter', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(...testData.items),

                Ensure.that(todoApp.outstandingItemsCount(), equals(testData.items.length)),
                Ensure.that(todoApp.persistedItems().length, equals(testData.items.length)),
            );
        });

        it('should show #main and #footer sections only when list contains items', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                Ensure.that(todoApp.hasItems(), isFalse()),
                Ensure.that(todoApp.footer, not(isPresent())),

                todoApp.recordItem(testData.items[0]),

                Ensure.that(todoApp.hasItems(), isTrue()),
                Ensure.that(todoApp.footer, isPresent()),
            );
        });
    });
});
