import { Ensure, equals } from '@serenity-js/assertions';
import { TestCompromisedError } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('is compromised', async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Ensure.that('Hello', equals('Hola'))
                    .otherwiseFailWith(TestCompromisedError, 'Translation DB is down, please cheer it up'),
            );
        });
    });
});
