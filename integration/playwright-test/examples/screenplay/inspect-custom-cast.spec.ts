import { Log, notes } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

export interface Notes {
    testServerUrl: string;
}

describe('Playwright Test configuration', () => {

    describe('A screenplay scenario', () => {

        it(`receives an actor from a custom cast`, async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Log.the(notes().get('contextOptions')),
                Log.the(notes().get('options')),
            );
        });
    });
});
