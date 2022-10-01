import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    // eslint-disable-next-line mocha/no-skipped-tests
    describe.skip('A scenario', () => {

        it('is marked as skipped at the group level', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
