import { test } from '@playwright/test';

test.describe('Expected failure', () => {

    test.describe('Test scenario', () => {

        test('fails as expected', () => {
            test.fail();

            throw new Error('Expected failure');
        });
    });
});
