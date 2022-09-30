import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('fails when an error is thrown', () => {
            throw new Error(`Something happened`); // fail with throw
        });
    });
});
