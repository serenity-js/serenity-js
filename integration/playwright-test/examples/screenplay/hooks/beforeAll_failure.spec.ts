import { Ensure, equals } from '@serenity-js/assertions';
import { Log } from '@serenity-js/core';
import { beforeAll, describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('BeforeAll failure', () => {

    describe('Test scenario', () => {

        beforeAll(async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Ensure.that(true, equals(false)),
            );
        })

        it(`is never executed #1`, async ({ actorCalled }) => {
            await actorCalled('Betty').attemptsTo(
                Log.the(actorCalled('Betty').abilityTo(BrowseTheWeb).constructor.name),
            );
        });

        it(`is never executed #2`, async ({ actorCalled }) => {
            await actorCalled('Barry').attemptsTo(
                Log.the(actorCalled('Barry').abilityTo(BrowseTheWeb).constructor.name),
            );
        });
    });
});
