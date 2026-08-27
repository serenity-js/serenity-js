import { Ensure, equals } from '@serenity-js/assertions';
import { GetRequest, LastResponse, Send } from '@serenity-js/rest';

import { describe, it } from '../fixtures';
import { testData } from '../test-data';

describe('Flaky', () => {

    describe('Todo List App', () => {

        it('should demonstrate a failing test', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(testData.items[0]),
                todoApp.recordItem(testData.items[1]),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[1],
                ])),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),

                Ensure.that(todoApp.outstandingItemsCount(), equals(1)),

                // Sync with the backend — this will fail because /status.json doesn't exist
                Send.a(GetRequest.to('/status.json')),
                Ensure.that(LastResponse.status(), equals(200)),
            );
        });
    });
});
