import { Log, notes } from '@serenity-js/core';
import { describe, it, test } from '@serenity-js/playwright-test';

import { CustomCast } from './actors/CustomCast';

describe('Playwright Test configuration', () => {

    test.use({
        actors: ({ extraContextOptions }, use) => {
            use(CustomCast({
                extraContextOptions,
                options: {
                    apiUrl: 'https://api.example.org',
                },
            }));
        },
    })

    describe('A screenplay scenario', () => {

        it(`receives an actor from a custom cast`, async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Log.the(notes().get('extraContextOptions')),
                Log.the(notes().get('options')),
            );
        });
    });
});
