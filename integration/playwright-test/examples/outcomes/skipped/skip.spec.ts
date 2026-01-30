import { test } from '@playwright/test';

test.describe('Skip', () => {

    test.describe('Test scenario', () => {

        test.skip('is marked as skipped', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
