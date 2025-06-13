import { test } from '@playwright/test';

test.describe('Error', () => {

    test.describe('Test scenario', () => {

        test('fails because of an error', () => {
            // fail with throw
            throw new Error(`Example error`);
        });
    });
});
