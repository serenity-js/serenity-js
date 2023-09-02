import { describe, it } from '@serenity-js/playwright-test';
import { ConfigurationError } from '@serenity-js/core/src';

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
