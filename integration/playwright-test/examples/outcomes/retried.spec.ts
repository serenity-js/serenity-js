import { test } from '@playwright/test';

test.describe('Retried', () => {

    test.describe('Test scenario', () => {

        // eslint-disable-next-line no-empty-pattern
        test.beforeAll(async ({ }, workerInfo) => {
            if (workerInfo.workerIndex < 2) {
                throw new Error(`Trigger failure for worker ${ workerInfo.workerIndex }`);
            }
        });

        test('passes the third time', () => {
            // third time lucky, isn't it?
        });
    });
});
