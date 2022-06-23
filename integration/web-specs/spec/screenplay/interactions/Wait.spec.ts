import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, Wait } from '@serenity-js/core';
import { By, Click, Navigate, PageElement, Text } from '@serenity-js/web';

/** @test {Wait} */
describe('Wait', () => {

    const status = PageElement.located(By.id('status')).describedAs('the header');
    const loadButton = PageElement.located(By.id('load')).describedAs('load button');

    describe('for', () => {

        /** @test {Wait.for} */
        it('pauses the actor flow for the length of an explicitly-set duration', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Ensure.that(Text.of(status), equals('Not ready')),
                Click.on(loadButton),
                Ensure.that(Text.of(status), equals('Loading...')),

                Wait.for(Duration.ofMilliseconds(1500)),

                Ensure.that(Text.of(status), equals('Ready!')),
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
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Ensure.that(Text.of(status), equals('Not ready')),
                Click.on(loadButton),
                Wait.until(Text.of(status), equals('Ready!')),

                Ensure.that(Text.of(status), equals('Ready!')),
            ));

        /** @test {Wait.upTo} */
        /** @test {Wait.until} */
        it('fails the actor flow when the timeout expires', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Ensure.that(Text.of(status), equals('Not ready')),
                Click.on(loadButton),

                Wait.upTo(Duration.ofMilliseconds(100)).until(Text.of(status), equals('Ready!')).pollingEvery(Duration.ofMilliseconds(50)),

            )).to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.be.equal(`Waited 100ms, polling every 50ms, for the text of the header to equal 'Ready!'`);
                expect(error.actual).to.be.equal('Loading...');
                expect(error.expected).to.be.equal('Ready!');
            }));

        /** @test {Wait#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.upTo(Duration.ofMilliseconds(10)).until(Text.of(status), equals('Ready!')).toString())
                .to.equal(`#actor waits up to 10ms, polling every 500ms, until the text of the header does equal 'Ready!'`);
        });
    });
});
