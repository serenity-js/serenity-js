import { expect } from '@integration/testing-tools';
import type { Optional} from '@serenity-js/core';
import { actorCalled, AssertionError, Question } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
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

    it('breaks the actor flow when "actual" is undefined', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(undefined, isPresent()),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected undefined to become present
            |
            | Expectation: isPresent()
            |
            | Expected boolean:   true
            | Received undefined
            |`);
    });

    it('breaks the actor flow when "actual" is null', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(null, isPresent()),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected null to become present
            |
            | Expectation: isPresent()
            |
            | Expected boolean: true
            | Received null
            |`);
    });

    it('breaks the actor flow when "actual" with custom isPresent method is not present', () => {
        class CustomType implements Optional {
            constructor(public readonly value: string) {
            }
            isPresent(): boolean {
                return false;
            }
            toString(): string {
                return `custom type: ${ this.value }`;
            }
        }

        const value = Question.about('custom type, like a PageElement', actor_ => new CustomType('example'));

        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(value, isPresent()),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected custom type, like a PageElement to become present
            |
            | Expectation: isPresent()
            |
            | Expected boolean:                  true
            | Received Proxy<QuestionStatement>
            |
            | CustomType {
            |   value: 'example'
            | }
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('example', isPresent()).toString())
            .to.equal(`#actor ensures that "example" does become present`);
    });
});
