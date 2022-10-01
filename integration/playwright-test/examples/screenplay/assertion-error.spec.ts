import { Ensure, equals  } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        it('correctly reports assertion errors', async ({ actorCalled }) => {
            await actorCalled('Donald').attemptsTo(
                Ensure.that(false, equals(true)),
            );
        });
    });
});
