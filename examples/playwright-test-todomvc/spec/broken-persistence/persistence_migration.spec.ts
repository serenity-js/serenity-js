import { Ensure, equals, isFalse, isTrue, property } from '@serenity-js/assertions';

import { describe, it } from '../fixtures';
import { testData } from '../test-data';

describe('Persistence API Migration', () => {

    describe('Todo List App', () => {

        it('should persist items using the new schema', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),
                todoApp.recordItem(testData.items[1]),

                // New schema uses 'title' instead of 'name'
                Ensure.that(todoApp.persistedItems()[0], property('title', equals(testData.items[0]))),
                Ensure.that(todoApp.persistedItems()[1], property('title', equals(testData.items[1]))),
            );
        });

        it('should persist completion status using the new schema', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(testData.items[0], testData.items[1]),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),

                // New schema uses 'done' instead of 'completed'
                Ensure.that(todoApp.persistedItems()[0], property('done', isTrue())),
                Ensure.that(todoApp.persistedItems()[1], property('done', isFalse())),
            );
        });

        it('should include lastModified timestamp when persisting', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),

                // New schema includes a 'lastModified' ISO timestamp
                Ensure.that(todoApp.persistedItems()[0], property('lastModified', equals(testData.items[0]))),
            );
        });

        it('should update lastModified when completing an item', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(testData.items[0], testData.items[1], testData.items[2]),

                todoApp.todoList.itemCalled(testData.items[1]).markAsCompleted(),

                // New schema should update 'lastModified' on state change
                Ensure.that(todoApp.persistedItems()[1], property('done', isTrue())),
                Ensure.that(todoApp.persistedItems()[1], property('lastModified', equals(testData.items[1]))),
            );
        });
    });
});
