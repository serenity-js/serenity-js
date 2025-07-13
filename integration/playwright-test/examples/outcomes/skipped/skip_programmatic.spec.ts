import { test } from '@playwright/test';

test.describe('Skip', () => {

    test.describe('Test scenario', () => {

        // eslint-disable-next-line no-empty-pattern
        test('is skipped programmatically', ({ }, testInfo) => {
            testInfo.skip();
        });
    });
});
