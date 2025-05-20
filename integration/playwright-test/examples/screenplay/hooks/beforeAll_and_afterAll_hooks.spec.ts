import { Log } from '@serenity-js/core';
import { afterAll, beforeAll, describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('BeforeAll and afterAll hooks', () => {

    beforeAll(async ({ actorCalled }) => {
        await actorCalled('Alice').attemptsTo(
            Log.the(actorCalled('Alice').abilityTo(BrowseTheWeb).constructor.name),
        );
    })

    describe('First test scenario', () => {

        beforeAll(async ({ actorCalled }) => {
            await actorCalled('Alex').attemptsTo(
                Log.the(actorCalled('Alex').abilityTo(BrowseTheWeb).constructor.name),
            )
        })

        it(`includes events that occurred in beforeAll hooks`, async ({ actorCalled }) => {
            await actorCalled('Betty').attemptsTo(
                Log.the(actorCalled('Betty').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });

    describe('Middle test scenario', () => {

        it(`does not include events from beforeAll and afterAll hooks`, async ({ actorCalled }) => {
            await actorCalled('Bobby').attemptsTo(
                Log.the(actorCalled('Bobby').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });

    describe('Last test scenario', () => {

        it(`includes events that occurred in afterAll hooks`, async ({ actorCalled }) => {
            await actorCalled('Barry').attemptsTo(
                Log.the(actorCalled('Barry').abilityTo(BrowseTheWeb).constructor.name),
            );
        });

        afterAll(async ({ actorCalled }) => {
            await actorCalled('Charlie').attemptsTo(
                Log.the(actorCalled('Charlie').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });

    afterAll(async ({ actorCalled }) => {
        await actorCalled('Chloe').attemptsTo(
            Log.the(actorCalled('Chloe').abilityTo(BrowseTheWeb).constructor.name),
        );
    });
});
