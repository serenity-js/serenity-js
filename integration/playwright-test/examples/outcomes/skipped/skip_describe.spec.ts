import { test } from '@playwright/test';

test.describe('Skip describe', () => {

    // eslint-disable-next-line mocha/no-skipped-tests
    test.describe.skip('Test scenario', () => {

        test('is marked as skipped at the describe level', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
