import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '../fixtures';

describe('Retries', () => {

    describe('Todo List App', () => {

        it('should pass upon a retry', async ({ actor, todoApp }, info) => {
            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(`Attempt #${ info.retry + 1 }`),
                Ensure.that(info.retry, equals(2)),
            );
        });
    });
});
