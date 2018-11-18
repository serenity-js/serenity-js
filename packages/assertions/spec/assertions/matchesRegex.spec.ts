import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { Ensure, matchesRegex } from '../../src';

describe('matchesRegex', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value ends with the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that('Hello World!', matchesRegex(/^[Hh]ello/)),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that('Hello World!', matchesRegex(/^¡[Hh]ola/)),
            )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to match /^¡[Hh]ola/`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that('Hello World!', matchesRegex(/^[Hh]ello/)).toString())
                .to.equal(`#actor ensures that 'Hello World!' does match /^[Hh]ello/`);
        });
    });
});
