import { test } from '@playwright/test';
import { AssertionError } from '@serenity-js/core';

test.describe('Serenity/JS assertion error', () => {

    test.describe('Test scenario', () => {

        test('fails when the Serenity/JS assertion fails', () => {
            throw new AssertionError('Expected true to equal false');
        });
    });
});
