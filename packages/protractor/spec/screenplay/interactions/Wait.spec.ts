import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, engage } from '@serenity-js/core';
import { by } from 'protractor';

import { Navigate, Target, Text, Wait } from '../../../src';
import { UIActors } from '../../UIActors';

/** @test {Wait} */
describe('Wait', () => {

    const Status = Target.the('header').located(by.id('status'));

    beforeEach(() => engage(new UIActors()));

    describe('for', () => {

        /** @test {Wait.for} */
        it('pauses the actor flow for the length of an explicitly-set duration', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Wait.for(Duration.ofMilliseconds(1500)),

                Ensure.that(Text.of(Status), equals('Ready!')),
            ));

        /** @test {Wait#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.for(Duration.ofMilliseconds(300)).toString())
                .to.equal(`#actor waits for 300ms`);
        });
    });

    describe('until', () => {

        /** @test {Wait.until} */
        it('pauses the actor flow until the expectation is met', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Wait.until(Text.of(Status), equals('Ready!')),

                Ensure.that(Text.of(Status), equals('Ready!')),
            ));

        /** @test {Wait.upTo} */
        /** @test {Wait.until} */
        it('fails the actor flow when the timeout expires', () =>
            expect(actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Wait.upTo(Duration.ofMilliseconds(10)).until(Text.of(Status), equals('Ready!')),
            )).to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.be.equal(`Waited 10ms for the text of the header to equal 'Ready!'`);
                expect(error.actual).to.be.equal('Loading...');
                expect(error.expected).to.be.equal('Ready!');

                expect(error.cause.name).to.equal('TimeoutError');
                expect(error.cause.message).to.match(/^Wait timed out after.*/);
            }));

        /** @test {Wait#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.upTo(Duration.ofMilliseconds(10)).until(Text.of(Status), equals('Ready!')).toString())
                .to.equal(`#actor waits up to 10ms until the text of the header does equal 'Ready!'`);
        });
    });
});
