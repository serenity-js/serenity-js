import { AssertionError } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('fails when the assertion fails', () => {
            throw new AssertionError('Expected true to equal false');
        });
    });
});
