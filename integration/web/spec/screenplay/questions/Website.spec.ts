import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
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
                Navigate.to(`chrome://accessibility/`),

                Ensure.that(Website.url(), equals(`chrome://accessibility/`)),
            ));

        /**
         *  @test {Website}
         *  @see https://github.com/serenity-js/serenity-js/issues/273
         */
        it(`correctly represents the URL containing special characters`, () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to(`chrome://accessibility/fr/noworries/#`),

                Ensure.that(Website.url(), equals(`chrome://accessibility/fr/noworries/#`)),
            ));
    });
});
