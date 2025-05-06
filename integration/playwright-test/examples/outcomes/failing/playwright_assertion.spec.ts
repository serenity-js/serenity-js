import { expect, test } from '@playwright/test';

test.describe('Playwright assertion', () => {

    test.describe('Test scenario', () => {

        test('fails when the assertion fails', () => {
            expect(true).toEqual(false);
        });
    });
});
