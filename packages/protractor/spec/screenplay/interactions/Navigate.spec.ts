import 'mocha';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Duration, engage, TestCompromisedError } from '@serenity-js/core';
import { by, error as errors } from 'protractor';

import { Navigate, Target, Text, Website } from '../../../src';
import { UIActors } from '../../UIActors';

/** @test {Navigate} */
describe('Navigate', () => {

    beforeEach(() => engage(new UIActors()));

    describe('to(url)', () => {

        /** @test {Navigate.to} */
        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/hello_world.html'),

                Ensure.that(Text.of(Target.the('heading').located(by.css('h1'))), equals('Hello World')),
            ));

        /** @test {Navigate.to} */
        it(`marks the test as compromised if the desired destination can't be reached`, () =>
            expect(actorCalled('Bernie').attemptsTo(
                Navigate.to('http://localhost:9999/invalid-destination'),
            )).
            to.be.rejectedWith(TestCompromisedError, `Couldn't navigate to http://localhost:9999/invalid-destination`).
            then((error: TestCompromisedError) => {
                expect(error.cause).to.be.instanceOf(errors.WebDriverError)
                expect(error.cause.message).to.include('net::ERR_CONNECTION_REFUSED')
            })
        );

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
        it('allows the actor to navigate back in the browser history', () =>
            actorCalled('Bernie').attemptsTo(
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
        it('allows the actor to navigate forward in the browser history', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/first.html'),
                Navigate.to('/screenplay/interactions/navigate/second.html'),

                Navigate.back(),
                Navigate.forward(),

                Ensure.that(Website.url(), endsWith('second.html')),
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
        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/reloaded.html'),

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
