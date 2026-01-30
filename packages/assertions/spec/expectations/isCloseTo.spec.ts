import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, isCloseTo } from '../../src';

describe('isCloseTo', () => {

    describe('with default tolerance', () => {

        it('allows for the actor flow to continue when the "actual" is equal to "expected"', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(2, isCloseTo(2)),
            )).to.be.fulfilled;
        });

        it('allows for the actor flow to continue when the "actual" is close to the "expected"', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(2.000_000_000_1, isCloseTo(2.000_000_000_0)),
            )).to.be.fulfilled;
        });

        it('contributes to a human-readable description', () => {
            expect(Ensure.that(2.00000000, isCloseTo(2.000000001)).toString())
                .to.equal(`#actor ensures that 2 does have value close to 2.000000001 ±1e-9`);
        });
    });

    describe('with custom tolerance', () => {
        it('allows for the actor flow to continue when the "actual" is close to the "expected"', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(10 / 3, isCloseTo(3.33, 0.005)),
            )).to.be.fulfilled;
        });

        it('contributes to a human-readable description', () => {
            expect(Ensure.that(10 / 3, isCloseTo(3.33, 0.005)).toString())
                .to.equal(`#actor ensures that 3.3333333333333335 does have value close to 3.33 ±0.005`);
        });
    });

    it('breaks the actor flow when "actual" is not close to the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(10.25, isCloseTo(10, 0.1)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 10.25 to have value close to 10 ±0.1
            |
            | Expectation: isCloseTo(10, 0.1)
            |
            | Expected number: 10
            | Received number: 10.25`);
    });

    it('breaks the actor flow when "actual" is infinite', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(Number.POSITIVE_INFINITY, isCloseTo(42)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected Infinity to have value close to 42 ±1e-9
            |
            | Expectation: isCloseTo(42)
            |
            | Expected number: 42
            | Received number: Infinity`);
    });

    it('breaks the actor flow when "expected" is infinite', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(42, isCloseTo(Number.NEGATIVE_INFINITY)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 42 to have value close to -Infinity ±1e-9
            |
            | Expectation: isCloseTo(-Infinity)
            |
            | Expected number: -Infinity
            | Received number: 42
            |`);
    });
});
