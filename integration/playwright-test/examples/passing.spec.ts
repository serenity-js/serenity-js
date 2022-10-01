import { afterEach, describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        afterEach(() => {
            // no-op, passing
        });

        it('passes', async ({ actorCalled }) => {
            // no-op, passing
        });
    });
});
