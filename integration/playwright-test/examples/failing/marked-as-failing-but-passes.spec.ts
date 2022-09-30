import { describe, it, test } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('is marked as failing, but passes', () => {
            test.fail()
        });
    });
});
