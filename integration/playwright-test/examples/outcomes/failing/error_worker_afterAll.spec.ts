import { test } from '@playwright/test';

test.describe('Error worker afterAll', () => {

    test.describe('Test scenario', () => {

        test.afterAll(() => {
            // fail with throw
            throw new Error(`Example worker-level error`);
        });

        test('fails because of a global, worker-level error', () => {
            // unreachable code
        });
    });
});
