import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

describe('Serenity/JS assertion', () => {

    describe('Test scenario', () => {

        it('fails when the Serenity/JS Screenplay assertion fails', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that('Hello', equals('Hola')),
            );
        });
    });
});
