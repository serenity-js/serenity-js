import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Target, Text, Website } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Navigate', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    describe('to', () => {

        /** @test {Navigate.to} */
        it('allows the actor to navigate to a desired destination', () => Bernie.attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                    <body>
                        <h1 id="h">Hello World</h1>
                    </body>
                </html>
            `)),

            Ensure.that(Text.of(Target.the('heading').located(by.id('h'))), equals('Hello World')),
        ));
    });

    describe('back', () => {

        /** @test {Navigate.back} */
        it('allows the actor to navigate back in the browser history', () => Bernie.attemptsTo(
            Navigate.to(`chrome://version/`),
            Navigate.to(`chrome://accessibility/`),

            Navigate.back(),

            Ensure.that(Website.url(), endsWith('version/')),
        ));

    });

    describe('forward', () => {

        /** @test {Navigate.forward} */
        it('allows the actor to navigate forward in the browser history', () => Bernie.attemptsTo(
            Navigate.to(`chrome://version/`),
            Navigate.to(`chrome://accessibility/`),

            Navigate.back(),
            Navigate.forward(),

            Ensure.that(Website.url(), endsWith('accessibility/')),
        ));

    });
});
