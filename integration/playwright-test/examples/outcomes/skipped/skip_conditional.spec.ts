import { test } from '@playwright/test';

test.describe('Skip conditional', () => {

    test.describe('Test scenario', () => {

        test('is marked as skipped conditionally', () => {
            // eslint-disable-next-line mocha/no-nested-tests,mocha/no-skipped-tests
            test.skip(true, 'Skipped because of good reasons');

            throw new Error('Playwright should not run this code at all');
        });
    });
});
