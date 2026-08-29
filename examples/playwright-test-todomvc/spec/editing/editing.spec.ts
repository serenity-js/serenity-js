import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';

import { beforeEach, describe, it } from '../fixtures';
import { testData } from '../test-data';

describe('Editing', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(...testData.items),
                Ensure.that(todoApp.persistedItemNames(), equals(testData.items)),
            );
        });

        it('should allow me to rename an item', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).rename('buy some sausages'),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    'buy some sausages',
                    testData.items[2],
                ])),

                Ensure.that(todoApp.persistedItems()[1].name, equals('buy some sausages')),
            );
        });

        it('should hide other controls when editing', async ({ actor, todoApp }) => {
            const item = todoApp.todoList.itemCalled(testData.items[1]);

            await actor.attemptsTo(
                item.edit(),
                Ensure.that(item.isEditing(), isTrue()),

                item.cancelEdit(),
                Ensure.that(item.isEditing(), isFalse()),
            );
        });

        it('should save edits on pressing enter', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).rename('buy some sausages'),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    'buy some sausages',
                    testData.items[2],
                ])),
            );
        });

        it('should trim entered text', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).rename('    buy some sausages    '),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    'buy some sausages',
                    testData.items[2],
                ])),
            );
        });

        it('should remove the item when the remove button is clicked', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).remove(),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[2],
                ])),
            );
        });

        it('should cancel edits on escape', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.todoList.itemCalled(testData.items[1]).edit(),
                todoApp.todoList.itemCalled(testData.items[1]).typeInEditor('buy some sausages'),
                todoApp.todoList.itemCalled(testData.items[1]).cancelEdit(),

                Ensure.that(todoApp.todoList.itemNames(), equals(testData.items)),
            );
        });
    });
});
