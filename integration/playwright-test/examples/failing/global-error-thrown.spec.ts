import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    throw new Error('Something happened');

    describe('A scenario', () => {

        it('where this shouldnt be invoked', () => {
            throw new Error(`This shouldn't happen`);
        });
    });
});