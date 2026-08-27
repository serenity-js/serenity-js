import { Ensure, equals, isFalse, isTrue, property } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../fixtures';
import { testData } from '../test-data';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding } from '../todo-list-app/TodoItem';

describe('Persistence', () => {

    describe('Todo List App', () => {

        it('should persist its data', async ({ actor, todoApp }) => {
            await actor.attemptsTo(
                todoApp.startWithAListContaining(testData.items[0], testData.items[1]),

                todoApp.todoList.itemCalled(testData.items[0]).markAsCompleted(),

                Ensure.that(todoApp.todoList.itemNames(), equals([
                    testData.items[0],
                    testData.items[1],
                ])),

                Ensure.that(todoApp.todoList.items().nth(0), isDisplayedAsCompleted()),
                Ensure.that(todoApp.persistedItems()[0], property('completed', isTrue())),

                Ensure.that(todoApp.todoList.items().nth(1), isDisplayedAsOutstanding()),
                Ensure.that(todoApp.persistedItems()[1], property('completed', isFalse())),

                Page.current().reload(),

                Ensure.that(todoApp.todoList.items().nth(0), isDisplayedAsCompleted()),
                Ensure.that(todoApp.persistedItems()[0], property('completed', isTrue())),

                Ensure.that(todoApp.todoList.items().nth(1), isDisplayedAsOutstanding()),
                Ensure.that(todoApp.persistedItems()[1], property('completed', isFalse())),
            );
        });
    });
});
