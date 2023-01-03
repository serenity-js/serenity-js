import { Log, TakeNotes } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { BrowseTheWeb } from '@serenity-js/web';

describe('Playwright Test configuration', () => {

    describe('A screenplay scenario', () => {

        it(`receives an actor with default abilities`, async ({ actors, actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Log.the(actors.constructor.name),
                Log.the(actorCalled('Alice').abilityTo(BrowseTheWeb).constructor.name),
                Log.the(actorCalled('Alice').abilityTo(TakeNotes).constructor.name),
            );
        });
    });
});
