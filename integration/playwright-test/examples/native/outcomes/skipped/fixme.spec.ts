import { test } from '@playwright/test';

test.describe('Fixme', () => {

    test.describe('Test scenario', () => {

        test.fixme('is marked as fixme', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
