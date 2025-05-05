import { Ensure, equals } from '@serenity-js/assertions';
import { TestCompromisedError } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Serenity/JS assertion', () => {

    describe('Test scenario', () => {

        it('is compromised', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that('Hello', equals('Hola'))
                    .otherwiseFailWith(TestCompromisedError, 'Translation DB is down, please cheer it up'),
            );
        });
    });
});
