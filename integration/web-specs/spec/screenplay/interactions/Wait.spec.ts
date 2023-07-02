import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, Wait } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { By, Click, Navigate, PageElement, Text } from '@serenity-js/web';

describe('Wait', () => {

    const status = () => PageElement.located(By.id('status')).describedAs('the header');    // eslint-disable-line unicorn/consistent-function-scoping
    const loadButton = () => PageElement.located(By.id('load')).describedAs('load button'); // eslint-disable-line unicorn/consistent-function-scoping

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = Wait.until(Text.of(status()), equals('Ready!'));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Wait.spec.ts');
            expect(location.line).to.equal(16);
            expect(location.column).to.equal(35);
        });

        it('correctly detects its invocation location when a custom timeout is used', () => {
            const activity = Wait.upTo(Duration.ofSeconds(1))
                .until(Text.of(status()), equals('Ready!'));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Wait.spec.ts');
            expect(location.line).to.equal(26);
            expect(location.column).to.equal(18);
        });

        it('correctly detects its invocation location when a custom polling interval is used', () => {
            const activity = Wait.upTo(Duration.ofSeconds(2))
                .until(Text.of(status()), equals('Ready!'))
                .pollingEvery(Duration.ofMilliseconds(500));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Wait.spec.ts');
            expect(location.line).to.equal(37);
            expect(location.column).to.equal(18);
        });
    });

    describe('for', () => {

        it('pauses the actor flow for the length of an explicitly-set duration', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Ensure.that(Text.of(status()), equals('Not ready')),
                Click.on(loadButton()),

                Wait.for(Duration.ofMilliseconds(6_000)),

                Ensure.that(Text.of(status()), equals('Ready!')),
            ));

        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.for(Duration.ofMilliseconds(300)).toString())
                .to.equal(`#actor waits for 300ms`);
        });

        it('correctly detects its invocation location', () => {
            const activity = Wait.for(Duration.ofMilliseconds(300));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Wait.spec.ts');
            expect(location.line).to.equal(66);
            expect(location.column).to.equal(38);
        });
    });

    describe('until', () => {

        it('pauses the actor flow until the expectation is met', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/loader.html'),

                Ensure.that(Text.of(status()), equals('Not ready')),
                Click.on(loadButton()),
                Wait.until(Text.of(status()), equals('Ready!')),

                Ensure.that(Text.of(status()), equals('Ready!')),
            ));

        it('fails the actor flow when the timeout expires', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/wait/slow_loader.html'),

                Ensure.that(Text.of(status()), equals('Not ready')),
                Click.on(loadButton()),

                Wait.upTo(Duration.ofSeconds(2))
                    .until(Text.of(status()), equals('Ready!'))
                    .pollingEvery(Duration.ofMilliseconds(500)),

            )).to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.match(new RegExp(trimmed`
                    | Timeout of 2s has expired while waiting for the text of the header to equal 'Ready!'
                    |
                    | Expectation: equals\\('Ready!'\\)
                    |
                    | Expected string: Ready!
                    | Received string: Loading...
                    |
                    | \\s{4}at .*screenplay/interactions/Wait.spec.ts:97:22`));
            }));

        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.upTo(Duration.ofSeconds(1)).until(Text.of(status()), equals('Ready!')).toString())
                .to.equal(`#actor waits until the text of the header does equal 'Ready!'`);
        });
    });
});
