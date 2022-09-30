import { describe, expect, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('fails when the assertion fails', () => {
            expect(true).toEqual(false);
        });
    });
});
