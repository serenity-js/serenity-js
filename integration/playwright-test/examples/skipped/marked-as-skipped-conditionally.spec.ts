import { describe, it, test } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        it('is marked as skipped conditionally', () => {
            test.skip(true, 'Skipped because of good reasons'); // eslint-disable-line mocha/no-nested-tests,mocha/no-skipped-tests
            
            throw new Error('Playwright should not run this code at all');
        });
    });
});
