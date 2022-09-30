import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('fails when the assertion fails', async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Ensure.that('Hello', equals('Hola')),
            );
        });
    });
});
