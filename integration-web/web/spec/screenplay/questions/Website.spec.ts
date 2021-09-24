import 'mocha';

import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Navigate, Website } from '@serenity-js/web';

describe('Website', () => {

    describe('title', () => {
        /** @test {Website} */
        it('allows the actor to read the title of the website', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/website/title.html'),

                Ensure.that(Website.title(), equals(`Hello World`)),
            ));
    });

    describe('url', () => {

        /** @test {Website} */
        it('allows the actor to read the URL of the website', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to(`/screenplay/questions/website/title.html`),

                Ensure.that(Website.url(), endsWith(`/screenplay/questions/website/title.html`)),
            ));

        /**
         *  @test {Website}
         *  @see https://github.com/serenity-js/serenity-js/issues/273
         */
        it(`correctly represents the URL containing special characters`, () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to(`/screenplay/questions/website/title.html#name`),

                Ensure.that(Website.url(), endsWith(`/screenplay/questions/website/title.html#name`)),
            ));
    });
});
