import { test } from '@playwright/test';

test.describe('Skip conditional', () => {

    test.describe('Test scenario', () => {

        test('is marked as skipped conditionally', () => {

            test.skip(true, 'Skipped because of good reasons');

            throw new Error('Playwright should not run this code at all');
        });
    });
});
