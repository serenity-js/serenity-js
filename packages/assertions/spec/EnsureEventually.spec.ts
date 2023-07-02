import { EventRecorder, expect } from '@integration/testing-tools';
import type { Answerable, RuntimeError} from '@serenity-js/core';
import { actorCalled, AssertionError, configure, Duration, ListItemNotFoundError, Question, TestCompromisedError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Ensure, equals } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

describe('EnsureEventually', () => {

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = Ensure.eventually(true, equals(true));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('EnsureEventually.spec.ts');
            expect(location.line).to.equal(15);
            expect(location.column).to.equal(37);
        });

        it('correctly detects its invocation location when used with custom errors', () => {
            const activity = Ensure.eventually(true, equals(true)).otherwiseFailWith(TestCompromisedError);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('EnsureEventually.spec.ts');
            expect(location.line).to.equal(24);
            expect(location.column).to.equal(68);
        });

        it('correctly detects its invocation location when used with custom timeout', () => {
            const activity = Ensure.eventually(true, equals(true)).timeoutAfter(Duration.ofMilliseconds(100));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('EnsureEventually.spec.ts');
            expect(location.line).to.equal(33);
            expect(location.column).to.equal(37);
        });
    });

    it('enables the actor to make an assertion', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.eventually(4, isIdenticalTo(4)),
        )).to.be.fulfilled;
    });

    it('fails the actor flow when the assertion is not met', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.eventually(4, isIdenticalTo(7)),
        )).to.be.rejectedWith(AssertionError, new RegExp(trimmed`
            | Expected 4 to eventually have value identical to 7
            |
            | Expectation: isIdenticalTo\\(7\\)
            |
            | Expected number: 7
            | Received number: 4
            |
            | \\s{4}at.*EnsureEventually.spec.ts:50:20`, 'gm'))
    });

    given([
        { actual: p(4), expectedMessage: 'Expected Promise to eventually have value identical to 7', description: 'Promise' },
        { actual: q(4), expectedMessage: 'Expected something to eventually have value identical to 7', description: 'Question' },
        { actual: q(p(4)), expectedMessage: 'Expected something to eventually have value identical to 7', description: 'Question<Promise>'  },
    ]).
    it('describes the actual as well as its value when possible', ({ actual, expectedMessage }) => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.eventually(actual, isIdenticalTo(7)).timeoutAfter(Duration.ofMilliseconds(500)),
        )).to.be.rejectedWith(AssertionError, new RegExp(trimmed`
            | ${ expectedMessage }
            |
            | Expectation: isIdenticalTo\\(7\\)
            |
            | Expected number: 7
            | Received number: 4
            |
            | \\s{4}at.*EnsureEventually.spec.ts:69:20`, 'gm')
        );
    });

    it('provides a description of the assertion being made', () => {
        expect(Ensure.eventually(4, isIdenticalTo(7)).toString()).to.equal(`#actor ensures that 4 does eventually have value identical to 7`);
    });

    it('provides a description of the assertion being made, while correctly cleaning the output from new line characters', () => {
        expect(Ensure.eventually({ person: { name: 'Jan' } }, equals({
            person: {
                name: 'Jan',
            },
        })).toString()).to.equal(`#actor ensures that {"person":{"name":"Jan"}} does eventually equal {"person":{"name":"Jan"}}`);
    });

    given<Answerable<number>>(
        42,
        p(42),
        q(42),
        q(p(42)),
    ).
    it('allows for the actual to be a Answerable<T> as it compares its value', (actual: Answerable<number>) => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.eventually(actual, isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    it('works', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.eventually(q(p(42)), isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    describe('when emitting an artifact', () => {
        let recorder;
        beforeEach(() => {

            recorder = new EventRecorder();

            configure({
                crew: [ recorder ],
            });
        });
    });

    describe('custom errors', () => {

        it('allows the actor to fail the flow with a custom RuntimeError, embedding the original error', () =>
            expect(
                actorCalled('Enrique').attemptsTo(
                    Ensure.eventually(503, equals(200)).otherwiseFailWith(TestCompromisedError),
                ),
            )
            .to.be.rejectedWith(TestCompromisedError, 'Expected 503 to eventually equal 200')
            .then((error: RuntimeError) => {
                expect(error.cause).to.be.instanceOf(AssertionError);
                expect(error.cause.message).to.match(new RegExp(trimmed `
                    | Expected 503 to eventually equal 200
                    |
                    | Expectation: equals\\(200\\)
                    |
                    | Expected number: 200
                    | Received number: 503
                    |
                    | \\s{4}at.*EnsureEventually.spec.ts:129:28`, 'gm'));
            }),
        );

        it('allows the actor to fail the flow with a custom RuntimeError with a custom error message', () => {
            return expect(actorCalled('Enrique').attemptsTo(
                Ensure.eventually(503, equals(200)).otherwiseFailWith(TestCompromisedError, 'The server is down. Please cheer it up.'),
            )).to.be.rejectedWith(TestCompromisedError, 'The server is down. Please cheer it up.');
        });
    });

    describe('when retrying', () => {

        it('enables the actor to make an assertion that passes when the expectation is eventually met', () => {
            let counter = 0;
            const currentCounter = () =>
                Question.about('value', actor => {
                    return ++ counter;
                });

            return expect(actorCalled('Enrique').attemptsTo(
                Ensure.eventually(currentCounter(), isIdenticalTo(1)),
            )).to.be.fulfilled;
        });

        given([
            { description: 'ListItemNotFoundError', error: new ListItemNotFoundError('Element not found in the list of 0 items') },
        ]).
        it('ignores transient errors ', ({ error }) => {
            let counter = 0;
            const currentCounter = () =>
                Question.about('value', actor => {
                    counter++
                    if (counter < 2) {
                        throw error;
                    }
                    return counter;
                });

            return expect(actorCalled('Enrique').attemptsTo(
                Ensure.eventually(currentCounter(), isIdenticalTo(2)),
            )).to.be.fulfilled;
        });
    });
});
