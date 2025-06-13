import { test } from '@playwright/test';

test.describe('Error worker beforeAll', () => {

    test.describe('Test scenario', () => {

        test.beforeAll(() => {
            // fail with throw
            throw new Error(`Example worker-level error`);
        });

        test('fails because of a global, worker-level error', () => {
            // unreachable code
        });
    });
});
