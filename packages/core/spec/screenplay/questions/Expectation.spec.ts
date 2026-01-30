
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { actorCalled, Expectation, ExpectationMet, ExpectationNotMet, Question } from '../../../src';
import { expect } from '../../expect';
import { isIdenticalTo } from '../../isIdenticalTo';

describe('Expectation', () => {

    const Ellie = actorCalled('Ellie');

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const q = <T>(value: T) =>
        Question.about(`some value`, actor => value);

    describe('thatActualShould()', () => {

        const value = 42;

        describe('provides a way to easily create custom expectation that', () => {

            const examples = [{
                description:    'number',
                expected:       value,
                message:        `have value identical to ${ value }`
            }, {
                description:    'Question<number>',
                expected:       q(value),
                message:        `have value identical to some value`
            }, {
                description:    'Promise<number>',
                expected:       p(value),
                message:        `have value identical to Promise`
            }, {
                description:    'Question<Promise<number>>',
                expected:       q(p(value)),
                message:        `have value identical to some value`
            }];

            given(examples).
            it('resolves to ExpectationMet when the expectation is met', async ({ expected, message }) => {

                const outcome = await expect(
                    isIdenticalTo(expected).isMetFor(value).answeredBy(Ellie)
                ).to.be.fulfilled

                expect(outcome).to.be.instanceOf(ExpectationMet);
                expect(outcome.message).to.equal(message);
                expect(outcome.expected).to.equal(value);
                expect(outcome.actual).to.equal(value);
            });

            given(examples).
            it('resolves with ExpectationNotMet when the expectation is not met', async ({ expected, message }) => {

                const outcome = await expect(
                    isIdenticalTo(expected).isMetFor(value).answeredBy(Ellie)
                ).to.be.fulfilled

                expect(outcome).to.be.instanceOf(ExpectationMet);
                expect(outcome.message).to.equal(message);
                expect(outcome.expected).to.equal(value);
                expect(outcome.actual).to.equal(value);
            });
        });
    });

    describe('to()', () => {

        const value = 42;

        const isTheSameAs = <T>(expected: T) =>
            Expectation.to<T>(`have value same as ${ expected }`)
                .soThatActual(isIdenticalTo(expected));

        describe('provides a way to alias and compose expectations', () => {

            it('provides an alias for a the composite', () => {
                expect(isTheSameAs(value).toString()).to.equal(`have value same as 42`)
            });

            it('resolves to ExpectationMet when the expectation is met and the message alias', async () => {

                const outcome = await expect(
                    isTheSameAs(value).isMetFor(value).answeredBy(Ellie)
                ).to.be.fulfilled

                expect(outcome).to.be.instanceOf(ExpectationMet);
                expect(outcome.message).to.equal(`have value identical to 42`);
                expect(outcome.expected).to.equal(value);
                expect(outcome.actual).to.equal(value);
            });

            it('resolves with ExpectationNotMet when the expectation is not met and the original message for any unmet expectations', async () => {

                const outcome = await expect(
                    isTheSameAs('hello').isMetFor('world').answeredBy(Ellie)
                ).to.be.fulfilled

                expect(outcome).to.be.instanceOf(ExpectationNotMet);
                expect(outcome.message).to.equal(`have value identical to 'hello'`);
                expect(outcome.expected).to.equal('hello');
                expect(outcome.actual).to.equal('world');
            });
        });
    });
});
