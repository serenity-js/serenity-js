import { Duration, Log, Wait } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Live events', () => {

    it('streams domain events while the scenario is still running', async ({ actorCalled }) => {
        await actorCalled('Alice').attemptsTo(
            Log.the('first interaction'),
            Wait.for(Duration.ofSeconds(2)),
            Log.the('second interaction'),
        );
    });
});
