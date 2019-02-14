import { AnswersQuestions, AssertionError, Interaction, KnowableUnknown } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { match } from 'tiny-types';

import { Expectation } from './Expectation';
import { ExpectationNotMet, Outcome } from './outcomes';

export class Ensure<Actual> implements Interaction {
    static that<A>(actual: KnowableUnknown<A>, expectation: Expectation<any, A>) {
        return new Ensure(actual, expectation);
    }

    constructor(
        private readonly actual: KnowableUnknown<Actual>,
        private readonly expectation: Expectation<Actual>,
    ) {
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
                    .else(_ => void 0),
                ),
            );
    }

    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
    }
}
