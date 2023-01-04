import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { beforeEach, describe, it } from '@serenity-js/playwright-test';
import { Enter, Key, Press } from '@serenity-js/web';

import { TODO_ITEMS } from './test-data';
import { persistedItemNames, persistedItems, startWithAListContaining } from './todo-list-app/TodoApp';
import { edit, editor, label, remove, rename, toggleButton } from './todo-list-app/TodoItem';
import { itemCalled, itemNames } from './todo-list-app/TodoList';

describe('Editing', () => {

    describe('Todo List App', () => {

        beforeEach(async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(...TODO_ITEMS),
                Ensure.that(persistedItemNames(), equals(TODO_ITEMS)),
            );
        });

        it('should allow me to rename an item', async ({ actor }) => {
            await actor.attemptsTo(
                rename(itemCalled(TODO_ITEMS[1])).to('buy some sausages'),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    'buy some sausages',
                    TODO_ITEMS[2],
                ])),

                Ensure.that(persistedItems()[1].name, equals('buy some sausages')),
            );
        });

        it('should hide other controls when editing', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(toggleButton().of(itemCalled(TODO_ITEMS[1])), isPresent()),
                Ensure.that(label().of(itemCalled(TODO_ITEMS[1])), isPresent()),

                edit(itemCalled(TODO_ITEMS[1])),

                Ensure.that(toggleButton().of(itemCalled(TODO_ITEMS[1])), not(isPresent())),
                Ensure.that(label().of(itemCalled(TODO_ITEMS[1])), not(isPresent())),
            );
        });

        it('should save edits on pressing enter', async ({ actor }) => {
            await actor.attemptsTo(
                edit(itemCalled(TODO_ITEMS[1])),

                Enter.theValue('buy some sausages').into(editor()),
                Press.the(Key.Enter).in(editor()),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    'buy some sausages',
                    TODO_ITEMS[2],
                ])),
            );
        });

        it('should trim entered text', async ({ actor }) => {
            await actor.attemptsTo(
                rename(itemCalled(TODO_ITEMS[1])).to('    buy some sausages    '),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    'buy some sausages',
                    TODO_ITEMS[2],
                ])),
            );
        });

        it('should remove the item when the remove button is clicked', async ({ actor }) => {
            await actor.attemptsTo(
                remove(itemCalled(TODO_ITEMS[1])),

                Ensure.that(itemNames(), equals([
                    TODO_ITEMS[0],
                    TODO_ITEMS[2],
                ])),
            );
        });

        it('should cancel edits on escape', async ({ actor }) => {
            await actor.attemptsTo(
                edit(itemCalled(TODO_ITEMS[1])),

                Enter.theValue('buy some sausages').into(editor()),
                Press.the(Key.Escape).in(editor()),

                Ensure.that(itemNames(), equals(TODO_ITEMS)),
            );
        });
    });
});
