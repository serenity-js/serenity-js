import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { isVisible, Value } from '@serenity-js/web';

import { TODO_ITEMS } from './test-data';
import {
    footerSection,
    mainSection,
    newTodoInput,
    outstandingItemsCount,
    persistedItemCalled,
    persistedItemNames,
    persistedItems,
    startWithAListContaining,
    startWithAnEmptyList,
} from './todo-list-app/TodoApp';
import { recordItem } from './todo-list-app/TodoItem';
import { itemNames } from './todo-list-app/TodoList';

describe('Recording items', () => {

    describe('Todo List App', () => {

        it('should allow me to add todo items', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                ])),

                recordItem(TODO_ITEMS[1]),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    TODO_ITEMS[1],
                ])),

                // note that `equals` and all the other expectations accept
                // either a static value or an Answerable
                Ensure.that(persistedItemNames(), equals(itemNames())),
            );
        });

        it('should clear text input field when an item is added', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(Value.of(newTodoInput()), equals('')),

                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).name, equals(TODO_ITEMS[0])),
                Ensure.that(persistedItemCalled(TODO_ITEMS[0]).completed, equals(false)),
            );
        });

        it('should reflect the number of items left in the counter', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),

                Ensure.that(outstandingItemsCount(), equals(TODO_ITEMS.length)),
                Ensure.that(persistedItems().length, equals(TODO_ITEMS.length)),
            );
        });

        it('should show #main and #footer sections only when list contains items', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                Ensure.that(mainSection(), not(isPresent())),
                Ensure.that(footerSection(), not(isPresent())),

                recordItem(TODO_ITEMS[0]),

                Ensure.that(mainSection(), isVisible()),
                Ensure.that(footerSection(), isVisible()),
            );
        });
    });
});
