import { beforeAll, describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        beforeAll(async ({ browserName }, workerInfo) => {
            if (workerInfo.workerIndex < 2) {
                throw new Error(`Trigger failure for worker ${ workerInfo.workerIndex }`);
            }
        });

        it('passes the third time', () => {
            // third time lucky, isn't it?
        });
    });
});
