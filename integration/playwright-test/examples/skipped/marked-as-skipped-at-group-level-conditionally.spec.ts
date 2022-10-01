import { describe, it, test } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        test.skip(true, 'Skipped because of good reasons'); // eslint-disable-line mocha/no-skipped-tests

        it('is marked as conditionally skipped at the group level', () => {
            throw new Error('Playwright should not run this code at all');
        });
    });
});
