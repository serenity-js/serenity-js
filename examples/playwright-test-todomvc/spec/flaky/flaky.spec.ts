import { Ensure, isTrue } from '@serenity-js/assertions';

import { describe, it } from '../fixtures';

describe('Flaky', () => {

    describe('Todo List App', () => {

        it('should sometimes work, and sometimes not', async ({ actor, todoApp }, info) => {
            const shouldPass = Math.random() < 0.9;

            await actor.attemptsTo(
                todoApp.startWithAnEmptyList(),

                todoApp.recordItem(`Should ${ shouldPass ? 'pass' : 'fail' } on attempt #${ info.retry + 1 }`),
                Ensure.that(shouldPass, isTrue()),
            );
        });
    });
});
