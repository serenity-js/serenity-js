import { TestCompromisedError } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Flaky', () => {

    describe('Todo List App', () => {

        it('should demonstrate a failing test', async ({ actor }, info) => {
            throw new TestCompromisedError('Example error');
        });
    });
});
