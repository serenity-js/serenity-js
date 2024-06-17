import { Ensure, equals } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';

import { describe, it, MyNotes } from './test-api';
import { persistedItemNames, startWithAListContaining, } from './todo-list-app/TodoApp';
import { recordItem } from './todo-list-app/TodoItem';
import { itemNames } from './todo-list-app/TodoList';

describe('Using notes', { tag: '@screenplay' }, () => {

    describe('Todo List App', () => {

        it('should allow me to use notes to load test data', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(
                    notes<MyNotes>().get('initialItems')[0],
                    notes<MyNotes>().get('initialItems')[1],
                ),

                recordItem(notes<MyNotes>().get('initialItems')[2]),

                Ensure.that(itemNames(), equals(notes().get('initialItems'))),

                Ensure.that(persistedItemNames(), equals(itemNames())),
            );
        });

        it('should allow me to perform bulk assertions', async ({ actor }) => {
            await actor.attemptsTo(
                notes<MyNotes>().set('expectedItems', [ 'buy a coffee' ]),
                notes<MyNotes>().get('expectedItems').push('learn Serenity/JS'),

                startWithAListContaining(
                    notes<MyNotes>().get('expectedItems')[0],
                    notes<MyNotes>().get('expectedItems')[1],
                ),

                Ensure.that(itemNames(), equals(notes<MyNotes>().get('expectedItems'))),

                Ensure.that(persistedItemNames(), equals(itemNames())),
            );
        });
    });
});
