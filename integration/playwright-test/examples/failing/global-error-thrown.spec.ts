import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A scenario', () => {

        throw new Error('Something happened');

        it('where this shouldnt be invoked', () => {
            throw new Error(`This shouldn't happen`);
        });
    });
});