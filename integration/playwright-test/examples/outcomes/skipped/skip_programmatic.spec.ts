import { test } from '@playwright/test';

test.describe('Skip', () => {

    test.describe('Test scenario', () => {

        test('is skipped programmatically', ({ }, testInfo) => {
            testInfo.skip();
        });
    });
});
