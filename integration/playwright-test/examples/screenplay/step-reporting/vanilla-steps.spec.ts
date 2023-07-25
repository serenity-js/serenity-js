import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A regular scenario', () => {

        it('reports Playwright step calls as steps', async () => {
            await it.step('outer', async () => {
                await it.step('inner', () => {
                    // ...
                })
            })
        })
    });
});
