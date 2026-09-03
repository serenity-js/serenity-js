import { Ensure, isPresent } from '@serenity-js/assertions';
import { Task, the } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Accessibility', () => {

    const urls = [
        '/index.html',
        '/index.html?page=about',
        '/index.html?page=contact',
    ];

    for (const url of urls) {
        it(`should have no accessibility violations at ${ url }`, async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to(url),
                Task.where(the`#actor assesses accessibility of ${ url }`,
                    Ensure.that(Page.current().title(), isPresent()),
                ),
            );
        });
    }
});
