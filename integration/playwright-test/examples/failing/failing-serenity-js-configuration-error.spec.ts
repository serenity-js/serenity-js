import { ConfigurationError } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('fails with a Serenity/JS ConfigurationError', () => {
            try {
                throw new Error('Example nested error');
            }
            catch (error) {
                throw new ConfigurationError('Example configuration error', error)
            }
        });
    });
});
