import { Log } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        it('propagates events to Serenity reporter', async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Log.the('Hello world'),
            );
        });
    });
});
