import { test } from '@playwright/test';
import { ConfigurationError } from '@serenity-js/core';

test.describe('Error configuration', () => {

    test.describe('Test scenario', () => {

        test('fails with a Serenity/JS ConfigurationError', () => {
            try {
                throw new Error('Example nested error');
            }
            catch (error) {
                throw new ConfigurationError('Example configuration error', error)
            }
        });
    });
});
