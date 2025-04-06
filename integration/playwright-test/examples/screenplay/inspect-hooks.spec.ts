import { Log } from '@serenity-js/core';
import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('Hooks', () => {

    beforeAll(async ({ actorCalled }) => {
        await actorCalled('Alice').attemptsTo(
            Log.the(actorCalled('Alice').abilityTo(BrowseTheWeb).constructor.name),
        )
    })

    beforeEach(async ({ actorCalled }) => {
        await actorCalled('Betty').attemptsTo(
            Log.the(actorCalled('Betty').abilityTo(BrowseTheWeb).constructor.name),
        )
    })

    describe('A screenplay scenario', () => {

        it(`receives an actor with default abilities`, async ({ actors, actorCalled }) => {
            await actorCalled('Charlie').attemptsTo(
                Log.the(actorCalled('Charlie').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });

    afterEach(async ({ actorCalled }) => {
        await actorCalled('Danielle').attemptsTo(
            Log.the(actorCalled('Danielle').abilityTo(BrowseTheWeb).constructor.name),
        )
    })

    afterAll(async ({ actorCalled }) => {
        await actorCalled('Ellie').attemptsTo(
            Log.the(actorCalled('Ellie').abilityTo(BrowseTheWeb).constructor.name),
        )
    })
});
