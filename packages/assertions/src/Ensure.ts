import { Answerable, AnswersQuestions, AssertionError, Interaction, LogicError } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { match } from 'tiny-types';

import { Expectation } from './Expectation';
import { ExpectationMet, ExpectationNotMet, Outcome } from './outcomes';

export class Ensure<Actual> extends Interaction {
    static that<A>(actual: Answerable<A>, expectation: Expectation<any, A>) {
        return new Ensure(actual, expectation);
    }

    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<Actual>,
    ) {
        super();
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return Promise.all([
            actor.answer(this.actual),
            actor.answer(this.expectation),
        ]).
        then(([ actual, expectation ]) =>
            expectation(actual).then(outcome =>
                match<Outcome<any, Actual>, void>(outcome)
                    .when(ExpectationNotMet, o => {
                        throw new AssertionError(
                            `Expected ${ formatted`${this.actual}` } to ${ o.message }`,
                            o.expected,
                            o.actual,
                        );
                    })
                    .when(ExpectationMet, _ => void 0)
                    .else(o => {
                        throw new LogicError(formatted `An Expectation should return an instance of an Outcome, not ${ o }`);
                    }),
                ),
            );
    }

    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
    }
}
