import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { startWithAnEmptyList } from './todo-list-app/TodoApp';
import { recordItem } from './todo-list-app/TodoItem';

describe('Flaky', () => {

    describe('Todo List App', () => {

        it('should sometimes work, and sometimes not', async ({ actor }, info) => {
            const shouldPass = Math.random() < 0.9;

            await actor.attemptsTo(
                startWithAnEmptyList(),

                recordItem(`Should ${ shouldPass ? 'pass' : 'fail' } on attempt #${ info.retry + 1 }`),
                Ensure.that(shouldPass, equals(true)),
            );
        });
    });
});
