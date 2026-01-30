import { describe, it } from '@serenity-js/playwright-test';

describe('My feature', { tag: '@feature' }, () => {

    describe('A scenario', { tag: [ '@scenario', '@issues:JIRA-1' ]}, () => {

        it('passes', { tag: [ '@positive', '@issues:JIRA-2,JIRA-3' ] }, async ({ actorCalled }) => {
            // no-op, passing
        });

        it.skip('manual test', { tag: '@manual' }, async ({ actorCalled }) => {});
    });
});
