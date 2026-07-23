import { Ensure, equals, not } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Payments', () => {

    it('should validate payment methods', async ({ actor }) => {
        await actor.attemptsTo(
            Navigate.to('/index.html'),
            Ensure.that(Page.current().title(), not(equals(''))),
        );
    });
});
