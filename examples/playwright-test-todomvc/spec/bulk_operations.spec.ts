import { contain, containItemsWhereEachItem, Ensure, equals, isPresent, not, property } from '@serenity-js/assertions';
import { afterEach, beforeEach, describe, it } from '@serenity-js/playwright-test';
import { Click, CssClasses, isSelected, Text } from '@serenity-js/web';

import { TODO_ITEMS } from './test-data';
import { clearCompletedButton, persistedItemNames, persistedItems, startWithAListContaining, toggleAllButton } from './todo-list-app/TodoApp';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding, markAsCompleted, markAsOutstanding } from './todo-list-app/TodoItem';
import { itemCalled, itemNames, items, toggleAllItems } from './todo-list-app/TodoList';

describe('Bulk operations', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),
                Ensure.that(persistedItems().length, equals(TODO_ITEMS.length)),
            );
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(persistedItems().length, equals(TODO_ITEMS.length)),
            );
        });

        it('should allow me to mark all items as completed', async ({ actor }) => {
            await actor.attemptsTo(
                toggleAllItems(),

                // An assertion that uses a custom expectation isDisplayedAsCompleted
                Ensure.that(
                    items(),
                    containItemsWhereEachItem(isDisplayedAsCompleted()),
                ),

                // Alternatively, the above assertion could be expressed using a forEach loop:
                items().forEach(({ item, actor }) =>
                    actor.attemptsTo(
                        Ensure.that(CssClasses.of(item), contain('completed')),
                    )),

                Ensure.that(
                    persistedItems(),
                    containItemsWhereEachItem(property('completed', equals(true))),
                ),
            );
        });

        it('should allow me to clear the complete state of all items', async ({ actor }) => {
            await actor.attemptsTo(
                toggleAllItems(),
                toggleAllItems(),

                Ensure.that(
                    items(),
                    containItemsWhereEachItem(isDisplayedAsOutstanding()),
                ),

                Ensure.that(
                    persistedItems(),
                    containItemsWhereEachItem(property('completed', equals(false))),
                ),
            );
        });

        it('complete all checkbox should update state when items are completed / cleared', async ({ actor }) => {
            await actor.attemptsTo(
                toggleAllItems(),

                Ensure.that(
                    toggleAllButton(),
                    isSelected(),
                ),

                markAsOutstanding(itemCalled(TODO_ITEMS[0])),

                Ensure.that(
                    toggleAllButton(),
                    not(isSelected()),
                ),

                markAsCompleted(itemCalled(TODO_ITEMS[0])),

                Ensure.that(
                    toggleAllButton(),
                    isSelected(),
                ),
            );
        });
    });

    describe('Clear completed button', () => {
        beforeEach(async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),
                Ensure.that(persistedItemNames(), equals(TODO_ITEMS)),
            );
        });

        it('should display the correct text', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[0])),
                Ensure.that(Text.of(clearCompletedButton()), equals('Clear completed')),
            );
        });

        it('should remove completed items when clicked', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),
                Click.on(clearCompletedButton()),

                Ensure.that(items().count(), equals(2)),
                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    TODO_ITEMS[2],
                ])),
            );
        });

        it('should be hidden when there are no items that are completed', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(TODO_ITEMS[1])),

                Click.on(clearCompletedButton()),

                Ensure.that(clearCompletedButton(), not(isPresent())),
            );
        });
    });
});
