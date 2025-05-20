import { Log } from '@serenity-js/core';
import { afterEach, beforeEach, describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('BeforeEach and afterEach hooks', () => {

    beforeEach(async ({ actorCalled }) => {
        await actorCalled('Alice').attemptsTo(
            Log.the(actorCalled('Alice').abilityTo(BrowseTheWeb).constructor.name),
        )
    })

    describe('Test scenario', () => {

        it(`includes events that occurred in beforeEach and afterEach hooks #1`, async ({ actorCalled }) => {
            await actorCalled('Betty').attemptsTo(
                Log.the(actorCalled('Betty').abilityTo(BrowseTheWeb).constructor.name),
            );
        });

        it(`includes events that occurred in beforeEach and afterEach hooks #2`, async ({ actorCalled }) => {
            await actorCalled('Barry').attemptsTo(
                Log.the(actorCalled('Barry').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });

    afterEach(async ({ actorCalled }) => {
        await actorCalled('Charlie').attemptsTo(
            Log.the(actorCalled('Charlie').abilityTo(BrowseTheWeb).constructor.name),
        )
    })
});
