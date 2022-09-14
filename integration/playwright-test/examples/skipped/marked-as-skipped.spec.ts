import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it.skip('is marked as skipped', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
