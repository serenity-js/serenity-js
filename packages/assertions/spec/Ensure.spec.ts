import { EventRecorder, expect } from '@integration/testing-tools';
import type { Answerable, AnswersQuestions, RuntimeError} from '@serenity-js/core';
import { actorCalled, AssertionError, configure, Expectation, LogicError, TestCompromisedError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Ensure, equals } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

describe('Ensure', () => {

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = Ensure.that(true, equals(true));
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Ensure.spec.ts');
            expect(location.line).to.equal(15);
            expect(location.column).to.equal(37);
        });

        it('correctly detects its invocation location when custom errors are used', () => {
            const activity = Ensure.that(true, equals(true)).otherwiseFailWith(TestCompromisedError);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Ensure.spec.ts');
            expect(location.line).to.equal(24);
            expect(location.column).to.equal(62);
        });
    });

    it('enables the actor to make an assertion', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(4, isIdenticalTo(4)),
        )).to.be.fulfilled;
    });

    it('fails the actor flow when the assertion is not met', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(4, isIdenticalTo(7)),
        )).to.be.rejectedWith(AssertionError, 'Expected 4 to have value identical to 7');
    });

    given([
        { actual: p(4), expectedMessage: 'Expected Promise to have value identical to 7', description: 'Promise' },
        { actual: q(4), expectedMessage: 'Expected something to have value identical to 7', description: 'Question' },
        { actual: q(p(4)), expectedMessage: 'Expected something to have value identical to 7', description: 'Question<Promise>'  },
    ]).
    it('describes the actual as well as its value when possible', ({ actual, expectedMessage }) => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(actual, isIdenticalTo(7)),
        )).to.be.rejectedWith(AssertionError, new RegExp(trimmed`
            | ${ expectedMessage }
            |
            | Expectation: isIdenticalTo\\(7\\)
            |
            | Expected number: 7
            | Received number: 4
            |
            | \\s{4}at.*Ensure.spec.ts:52:20`, 'gm')
        );
    });

    it('provides a description of the assertion being made', () => {
        expect(Ensure.that(4, isIdenticalTo(7)).toString()).to.equal(`#actor ensures that 4 does have value identical to 7`);
    });

    it('provides a description of the assertion being made, while correctly cleaning the output from new line characters', () => {
        expect(Ensure.that({ person: { name: 'Jan' } }, equals({
            person: {
                name: 'Jan',
            },
        })).toString()).to.equal(`#actor ensures that { person: { name: "Jan" } } does equal { person: { name: "Jan" } }`);
    });

    given<Answerable<number>>(
        42,
        p(42),
        q(42),
        q(p(42)),
    ).
    it('allows for the actual to be a Answerable<T> as it compares its value', (actual: Answerable<number>) => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(actual, isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    it('works', () => {
        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(q(p(42)), isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    it(`complains when given an Expectation that doesn't conform to the interface`, () => {
        class BrokenExpectation<Actual> extends Expectation<Actual> {
            constructor() {
                super(
                    'broken',
                    'broken',
                    (_actor: AnswersQuestions, _actual: Answerable<Actual>) => {
                        return undefined as any;
                    },
                );
            }
        }

        return expect(actorCalled('Enrique').attemptsTo(
            Ensure.that(4, new BrokenExpectation()),
        )).to.be.rejectedWith(LogicError, 'Expectation#isMetFor(actual) should return an instance of an ExpectationOutcome, not undefined');
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
                    Ensure.that(503, equals(200)).otherwiseFailWith(TestCompromisedError),
                ),
            )
            .to.be.rejectedWith(TestCompromisedError, 'Expected 503 to equal 200')
            .then((error: RuntimeError) => {
                expect(error.cause).to.be.instanceOf(AssertionError);
                expect(error.cause.message).to.match(new RegExp(trimmed `
                    | Expected 503 to equal 200
                    |
                    | Expectation: equals\\(200\\)
                    |
                    | Expected number: 200
                    | Received number: 503
                    |
                    | \\s{4}at.*Ensure.spec.ts:131:28`, 'gm'));
            }),
        );

        it('allows the actor to fail the flow with a custom RuntimeError with a custom error message', () => {
            return expect(actorCalled('Enrique').attemptsTo(
                Ensure.that(503, equals(200)).otherwiseFailWith(TestCompromisedError, 'The server is down. Please cheer it up.'),
            )).to.be.rejectedWith(TestCompromisedError, 'The server is down. Please cheer it up.');
        });
    });
});
