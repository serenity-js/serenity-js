import 'mocha';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, TestCompromisedError } from '@serenity-js/core';

import { by, Navigate, Target, Text, Website } from '../../../src';

/** @test {Navigate} */
describe('Navigate', () => {

    describe('to(url)', () => {

        /** @test {Navigate.to} */
        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/hello_world.html'),

                Ensure.that(Text.of(Target.the('heading').located(by.css('h1'))), equals('Hello World')),
            ));

        /** @test {Navigate.to} */
        it(`marks the test as compromised if the desired destination can't be reached`, () =>
            expect(actorCalled('Wendy').attemptsTo(
                Navigate.to('http://localhost:9999/invalid-destination'),
            )).
            to.be.rejectedWith(TestCompromisedError, `Couldn't navigate to http://localhost:9999/invalid-destination`).
            then((error: TestCompromisedError) => {
                expect(error.cause).to.be.instanceOf(Error)
                expect(error.cause.message).to.include('net::ERR_CONNECTION_REFUSED at http://localhost:9999/invalid-destination')
            })
        );

        /** @test {Navigate.to} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.to(`https://serenity-js.org`).toString())
                .to.equal(`#actor navigates to 'https://serenity-js.org'`);
        });
    });

    describe('back', () => {

        /** @test {Navigate.back} */
        it('allows the actor to navigate back in the browser history', () => 
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/first.html'),
                Navigate.to('/screenplay/interactions/navigate/second.html'),

                Navigate.back(),
    
                Ensure.that(Website.url(), endsWith('/first.html')),
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
            actorCalled('Wendy').attemptsTo(
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
            actorCalled('Wendy').attemptsTo(
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
