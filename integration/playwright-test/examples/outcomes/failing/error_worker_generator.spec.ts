import { test } from '@playwright/test';

function examples(): string[] {
    throw new Error(`Worker-level error preventing test generation`);
}

test.describe('Error worker parsing', () => {

    test.describe('Test scenario', () => {

        for (const example of examples()) {
            test(`fails because of a global, worker-level error (${ example })`, () => {
                // unreachable code
            });
        }
    });
});
