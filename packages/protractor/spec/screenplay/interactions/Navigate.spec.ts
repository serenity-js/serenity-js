import 'mocha';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Duration } from '@serenity-js/core';
import { by } from 'protractor';

import { Navigate, Target, Text, Website } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @test {Navigate} */
describe('Navigate', () => {

    describe('to(url)', () => {

        /** @test {Navigate.to} */
        it('allows the actor to navigate to a desired destination', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                    <body>
                        <h1 id="h">Hello World</h1>
                    </body>
                </html>
            `)),

            Ensure.that(Text.of(Target.the('heading').located(by.id('h'))), equals('Hello World')),
        ));

        /** @test {Navigate.to} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.to(`https://serenity-js.org`).toString())
                .to.equal(`#actor navigates to 'https://serenity-js.org'`);
        });
    });

    describe('to(url).withTimeout(duration)', function () {

        /** @test {Navigate.to} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.to(`https://serenity-js.org`).withTimeout(Duration.ofSeconds(5)).toString())
                .to.equal(`#actor navigates to 'https://serenity-js.org' waiting up to 5s for Angular to load`);
        });
    });

    describe('back', () => {

        /** @test {Navigate.back} */
        it('allows the actor to navigate back in the browser history', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(`chrome://version/`),
            Navigate.to(`chrome://accessibility/`),

            Navigate.back(),

            Ensure.that(Website.url(), endsWith('version/')),
        ));

        /** @test {Navigate.back} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.back().toString())
                .to.equal(`#actor navigates back in the browser history`);
        });
    });

    describe('forward', () => {

        /** @test {Navigate.forward} */
        it('allows the actor to navigate forward in the browser history', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(`chrome://version/`),
            Navigate.to(`chrome://accessibility/`),

            Navigate.back(),
            Navigate.forward(),

            Ensure.that(Website.url(), endsWith('accessibility/')),
        ));

        /** @test {Navigate.forward} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.forward().toString())
                .to.equal(`#actor navigates forward in the browser history`);
        });
    });

    describe('reloadPage', () => {

        /** @test {Navigate.reloadPage} */
        it('allows the actor to navigate to a desired destination', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                    <body>
                        <h1 id="h">Hello!</h1>
                    </body>
                    <script>
                        if(window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
                            document.getElementById('h').textContent = 'Reloaded'
                        }
                    </script>
                </html>
            `)),

            Navigate.reloadPage(),

            Ensure.that(Text.of(Target.the('heading').located(by.id('h'))), equals('Reloaded')),
        ));

        /** @test {Navigate.reloadPage} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.reloadPage().toString())
                .to.equal(`#actor reloads the page`);
        });
    });
});
