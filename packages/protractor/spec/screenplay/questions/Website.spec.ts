import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Website } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Website', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    describe('title', () => {
        /** @test {Attribute} */
        it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                    <head>
                        <title>Hello World</title>
                    </head>
                </html>
            `)),

            Ensure.that(Website.title(), equals(`Hello World`)),
        ));
    });

    describe('url', () => {

        /** @test {Attribute} */
        it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
            Navigate.to(`chrome://accessibility/`),

            Ensure.that(Website.url(), equals(`chrome://accessibility/`)),
        ));
    });
});
