import { Ensure, equals, property } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { Page } from '@serenity-js/web';

import { testData } from './test-data';
import { persistedItems, startWithAListContaining } from './todo-list-app/TodoApp';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding, markAsCompleted } from './todo-list-app/TodoItem';
import { itemCalled, itemNames, items } from './todo-list-app/TodoList';

describe('Persistence', { tag: '@screenplay' }, () => {

    describe('Todo List App', () => {

        it('should persist its data', async ({ actor }) => {
            await actor.attemptsTo(
                startWithAListContaining(testData.items[0], testData.items[1]),

                markAsCompleted(itemCalled(testData.items[0])),

                Ensure.that(itemNames(), equals([
                    testData.items[0],
                    testData.items[1],
                ])),

                Ensure.that(items().nth(0), isDisplayedAsCompleted()),
                Ensure.that(persistedItems()[0], property('completed', equals(true))),

                Ensure.that(items().nth(1), isDisplayedAsOutstanding()),
                Ensure.that(persistedItems()[1], property('completed', equals(false))),

                Page.current().reload(),

                Ensure.that(items().nth(0), isDisplayedAsCompleted()),
                Ensure.that(persistedItems()[0], property('completed', equals(true))),

                Ensure.that(items().nth(1), isDisplayedAsOutstanding()),
                Ensure.that(persistedItems()[1], property('completed', equals(false))),
            );
        });
    });
});
