import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { startWithAnEmptyList } from './todo-list-app/TodoApp';
import { recordItem } from './todo-list-app/TodoItem';

describe('Retries', () => {

    describe('Todo List App', () => {

        it('should allow me to retry a test', async ({ actor }, info) => {
            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(`Attempt #${ info.retry + 1 }`),
                Ensure.that(info.retry, equals(2)),
            );
        });
    });
});
