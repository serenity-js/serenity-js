import { Activity, AnswersQuestions, AssertionError, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { Assertion } from './Assertion';
import { descriptionOf } from './values';

export class Ensure<Expected, Actual = Expected> implements Interaction {

    static that<E, A>(
        actual: KnowableUnknown<A>,
        assertion: Assertion<KnowableUnknown<E>, A>,
    ): Activity {
        return new Ensure<E, A>(actual, assertion);
    }

    constructor(
        private readonly actual: KnowableUnknown<Actual>,
        private readonly assertion: Assertion<KnowableUnknown<Expected>, Actual>,
    ) {
    }

    performAs(actor: AnswersQuestions & UsesAbilities): Promise<void> {
        return Promise.all([
                actor.answer(this.actual),
                actor.answer(this.assertion.expected),
            ])
            .then(([ actual, expected ]) => {
                if (! this.assertion.test(expected, actual)) {
                    throw new AssertionError(
                        `Expected ${ descriptionOf(actual) } to ${ this.assertion.toString() } ${ descriptionOf(expected) }`,
                        this.assertion.expected,
                        this.actual,
                    );
                }
            });
    }

    toString() {
        return `#actor ensures that ${ descriptionOf(this.actual) } does ${ this.assertion.toString() } ${ descriptionOf(this.assertion.expected) }`;
    }
}
