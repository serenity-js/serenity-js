import 'mocha';

import { EventRecorder, expect, PickEvent, stage } from '@integration/testing-tools';
import { Actor, Answerable, AnswersQuestions, AssertionError, LogicError, Question, RuntimeError, Stage, TestCompromisedError } from '@serenity-js/core';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';
import { Ensure, equals, Expectation, Outcome } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

/** @test {Ensure} */
describe('Ensure', () => {

    let theStage: Stage,
        Enrique: Actor;

    beforeEach(() => {
        theStage = stage();
        Enrique = theStage.theActorCalled('Enrique');
    });

    /** @test {Ensure.that} */
    it('allows the actor to make an assertion', () => {
        return expect(Enrique.attemptsTo(
            Ensure.that(4, isIdenticalTo(4)),
        )).to.be.fulfilled;
    });

    /** @test {Ensure.that} */
    it('fails the actor flow when the assertion is not met', () => {
        return expect(Enrique.attemptsTo(
            Ensure.that(4, isIdenticalTo(7)),
        )).to.be.rejectedWith(AssertionError, 'Expected 4 to have value identical to 7');
    });

    /** @test {Ensure.that} */
    it('provides a description of the assertion being made', () => {
        expect(Ensure.that(4, isIdenticalTo(7)).toString()).to.equal(`#actor ensures that 4 does have value identical to 7`);
    });

    /** @test {Ensure.that} */
    it('provides a description of the assertion being made, while correctly cleaning the output from new line characters', () => {
        expect(Ensure.that({ person: { name: 'Jan' }}, equals({
            person: {
                name: 'Jan',
            },
        })).toString()).to.equal(`#actor ensures that { person: { name: 'Jan' } } does equal { person: { name: 'Jan' } }`);
    });

    given<Answerable<number>>(
        42,
        p(42),
        q(42),
        q(p(42)),
    ).
    /** @test {Ensure.that} */
    it('allows for the actual to be a Answerable<T> as it compares its value', (actual: Answerable<number>) => {
        return expect(Enrique.attemptsTo(
            Ensure.that(actual, isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    /** @test {Ensure.that} */
    it('complains when given an Expectation that doesn\'t conform to the interface', () => {
        class BrokenExpectation<Expected, Actual> extends Expectation<Expected, Actual> {
            answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {
                return (actual: Actual) => Promise.resolve(null);
            }

            toString(): string {
                return `broken`;
            }
        }

        return expect(Enrique.attemptsTo(
            Ensure.that(4, new BrokenExpectation()),
        )).to.be.rejectedWith(LogicError, 'An Expectation should return an instance of an Outcome, not null');
    });

    given([{
        description: 'tiny type',
        actual: new Name('Bob'),
        expected: 'Name(value=Bob)',
    }, {
        description: 'boolean',
        actual: true,
        expected: 'true',
    }, {
        description: 'string',
        actual: 'name',
        expected: `'name'`,
    }, {
        description: 'list',
        actual: [{ name: 'Bob' }, { name: 'Alice' }],
        expected: `[\n  { name: 'Bob' },\n  { name: 'Alice' }\n]`,
    }, {
        description: 'promise',
        actual: Promise.resolve(true),
        expected: `true`,
    }, {
        description: 'question',
        actual: Question.about('some value', actor => 'value'),
        expected: `'value'`,
    }]).
    /** @test {Ensure.that} */
    it('emits an artifact describing the actual value', ({ actual, expected }) => {
        const recorder = new EventRecorder();
        theStage.assign(recorder);

        return expect(Enrique.attemptsTo(
            Ensure.that(actual, equals(null)),  // we don't care about the expectation itself in this test
        )).to.be.rejected.then(() =>

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, e => e.artifact.map(value => {
                    expect(value.contentType).to.equal('text/plain');
                    expect(value.data).to.equal(expected);
                })),
        );

    });

    describe('custom errors', () => {

        it('allows the actor to fail the flow with a custom RuntimeError, embedding the original error', () => {
            return expect(Enrique.attemptsTo(
                    Ensure.that(503, equals(200)).otherwiseFailWith(TestCompromisedError),
                ))
                .to.be.rejectedWith(TestCompromisedError, 'Expected 503 to equal 200')
                .then((error: RuntimeError) => {
                    expect(error.cause).to.be.instanceOf(AssertionError);
                    expect(error.cause.message).to.be.equal('Expected 503 to equal 200');
                });
        });

        it('allows the actor to fail the flow with a custom RuntimeError with a custom error message', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that(503, equals(200)).otherwiseFailWith(TestCompromisedError, 'The server is down. Please cheer it up.'),
            )).to.be.rejectedWith(TestCompromisedError, 'The server is down. Please cheer it up.');
        });
    });
});
