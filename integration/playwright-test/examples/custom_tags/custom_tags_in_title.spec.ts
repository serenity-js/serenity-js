import { describe, it } from '@serenity-js/playwright-test';

describe('My feature @feature', () => {

    describe('A scenario @scenario @issues:JIRA-1', () => {

        it('passes @positive @issues:JIRA-2,JIRA-3', async ({ actorCalled }) => {
            // no-op, passing
        });

        it.skip('manual test @manual', async ({ actorCalled }) => {});
    });
});
