import { Ensure, equals } from '@serenity-js/assertions';
import { Log } from '@serenity-js/core';
import { afterAll, describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('BeforeAll failure', () => {

    describe('Test scenario', () => {

        it(`is executed`, async ({ actorCalled }) => {
            await actorCalled('Betty').attemptsTo(
                Log.the(actorCalled('Betty').abilityTo(BrowseTheWeb).constructor.name),
            );
        });

        afterAll('fails', async ({ actorCalled }) => {
            await actorCalled('Chloe').attemptsTo(
                Ensure.that(true, equals(false)),
            );
        })
    });

    afterAll('passes', async ({ actorCalled }) => {
        await actorCalled('Cindy').attemptsTo(
            Log.the(actorCalled('Cindy').abilityTo(BrowseTheWeb).constructor.name),
        );
    })
});
