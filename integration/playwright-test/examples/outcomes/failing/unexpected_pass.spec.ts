import { test } from '@playwright/test';

test.describe('Unexpected pass', () => {

    test.describe('Test scenario', () => {

        test('is marked as failing but passes', () => {
            test.fail();
        });
    });
});
