import { Ensure, not, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('End-to-End Flows', () => {

    it('should complete a full purchase flow', async ({ actor }) => {
        await actor.attemptsTo(
            Navigate.to('/index.html'),
            Ensure.that(Page.current().title(), not(equals(''))),
        );
    });
});
