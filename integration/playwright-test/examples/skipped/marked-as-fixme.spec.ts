import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it.fixme('is marked as fixme', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
