import { test } from '@playwright/test';

test.describe('Skip describe conditional', () => {

    // eslint-disable-next-line mocha/no-skipped-tests
    test.describe('Test scenario', () => {

        // eslint-disable-next-line mocha/no-skipped-tests
        test.skip(true, 'Skipped because of good reasons');

        test('is marked as skipped conditionally at the describe level', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
