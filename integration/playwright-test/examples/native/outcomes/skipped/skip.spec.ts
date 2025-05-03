import { test } from '@playwright/test';

test.describe('Skip', () => {

    test.describe('Test scenario', () => {

        // eslint-disable-next-line mocha/no-skipped-tests
        test.skip('is marked as skipped', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
