import { AnswersQuestions, Interaction, KnowableUnknown } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Assertion } from './assertions';

export class Ensure<Actual> implements Interaction {
    static that<A>(actual: KnowableUnknown<A>, assertion: Assertion<any, A>) {
        return new Ensure(actual, assertion);
    }

    constructor(
        private readonly actual: KnowableUnknown<Actual>,
        private readonly assertion: Assertion<Actual>,
    ) {
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return Promise.all([
            actor.answer(this.actual),
            actor.answer(this.assertion),
        ]).
        then(([ actual, assertion ]) => assertion(actual));
        // todo: throw AssertionError if assertion not met
    }

    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.assertion }`;
    }
}
