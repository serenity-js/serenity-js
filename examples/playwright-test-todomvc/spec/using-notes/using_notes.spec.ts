import { Ensure, equals } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';

import { describe, it, MyNotes } from '../test-api';

describe('Using notes', () => {

    describe('Todo List App', () => {

        it('should allow me to use notes to load test data', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(
                    notes<MyNotes>().get('initialItems')[0],
                    notes<MyNotes>().get('initialItems')[1],
                ),

                todoApp.recordItem(notes<MyNotes>().get('initialItems')[2]),

                Ensure.that(todoApp.todoList.itemNames(), equals(notes().get('initialItems'))),

                Ensure.that(todoApp.persistedItemNames(), equals(todoApp.todoList.itemNames())),
            );
        });

        it('should allow me to perform bulk assertions', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                notes<MyNotes>().set('expectedItems', [ 'buy a coffee' ]),
                notes<MyNotes>().get('expectedItems').push('learn Serenity/JS'),

                todoApp.startWithAListContaining(
                    notes<MyNotes>().get('expectedItems')[0],
                    notes<MyNotes>().get('expectedItems')[1],
                ),

                Ensure.that(todoApp.todoList.itemNames(), equals(notes<MyNotes>().get('expectedItems'))),

                Ensure.that(todoApp.persistedItemNames(), equals(todoApp.todoList.itemNames())),
            );
        });
    });
});
