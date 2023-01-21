import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Optional, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Ensure, isPresent } from '../../src';

describe('isPresent', () => {

    given([
        { description: 'truthy boolean',    value: true             },
        { description: 'falsy boolean',     value: false            },
        { description: 'truthy number',     value: 42               },
        { description: 'falsy number',      value: 0                },
        { description: 'truthy string',     value: 'Hello'          },
        { description: 'falsy string',      value: ''               },
        { description: 'object',            value: { name: 'Jan' }  },
    ]).
    it('allows for the actor flow to continue when the "actual" is present', ({  value }) => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(value, isPresent()),
        )).to.be.fulfilled;
    });

    given<Optional>([
        { isPresent: () => true },
        { isPresent: () => Promise.resolve(true) },
        { isPresent: () => Question.about('is present', _actor => true) },
        { isPresent: () => Question.about('is present', _actor => Promise.resolve(true)) },
    ]).
    it('allows for the actor flow to continue when the Optional "actual" is present', (optional: Optional) => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(optional, isPresent()),
        )).to.be.fulfilled;
    });

    given([
        { description: 'undefined', value: undefined    },
        { description: 'null',      value: null         },  // eslint-disable-line unicorn/no-null
    ]).
    it('breaks the actor flow when "actual" is not present', ({ description, value }) => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(value, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Expected ${ description } to become present`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('example', isPresent()).toString())
            .to.equal(`#actor ensures that 'example' does become present`);
    });
});
