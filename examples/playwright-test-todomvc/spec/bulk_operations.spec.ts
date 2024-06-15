import { contain, containItemsWhereEachItem, Ensure, equals, isPresent, not, property } from '@serenity-js/assertions';
import { afterEach, beforeEach, describe, it } from '@serenity-js/playwright-test';
import { Click, CssClasses, isSelected, Text } from '@serenity-js/web';

import { testData } from './test-data';
import { clearCompletedButton, persistedItemNames, persistedItems, startWithAListContaining, toggleAllButton } from './todo-list-app/TodoApp';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding, markAsCompleted, markAsOutstanding } from './todo-list-app/TodoItem';
import { itemCalled, itemNames, items, toggleAllItems } from './todo-list-app/TodoList';

describe('Bulk operations', { tag: '@screenplay' }, () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...testData.items),
                Ensure.that(persistedItems().length, equals(testData.items.length)),
            );
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(persistedItems().length, equals(testData.items.length)),
            );
        });

        it('should allow me to mark all items as completed @markAllCompleted', async ({ actor }) => {
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

        it('should allow me to clear the complete state of all items @clearAll', async ({ actor }) => {
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

        it('complete all checkbox should update state when items are completed / cleared @completeAll', async ({ actor }) => {
            await actor.attemptsTo(
                toggleAllItems(),

                Ensure.that(
                    toggleAllButton(),
                    isSelected(),
                ),

                markAsOutstanding(itemCalled(testData.items[0])),

                Ensure.that(
                    toggleAllButton(),
                    not(isSelected()),
                ),

                markAsCompleted(itemCalled(testData.items[0])),

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
                startWithAListContaining(...testData.items),
                Ensure.that(persistedItemNames(), equals(testData.items)),
            );
        });

        it('should display the correct text', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(testData.items[0])),
                Ensure.that(Text.of(clearCompletedButton()), equals('Clear completed')),
            );
        });

        it('should remove completed items when clicked', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(testData.items[1])),
                Click.on(clearCompletedButton()),

                Ensure.that(items().count(), equals(2)),
                Ensure.that(itemNames(), equals([
                    testData.items[0],
                    testData.items[2],
                ])),
            );
        });

        it('should be hidden when there are no items that are completed', async ({ actor }) => {
            await actor.attemptsTo(
                markAsCompleted(itemCalled(testData.items[1])),

                Click.on(clearCompletedButton()),

                Ensure.that(clearCompletedButton(), not(isPresent())),
            );
        });

        it.fixme('should mark test as manual @manual', async () => {});
    });
});
