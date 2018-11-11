import { Activity, AnswersQuestions, AssertionError, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { Assertion } from './Assertion';
import { descriptionOf } from './values';

export class Ensure<T> implements Interaction {

    static that<V>(
        actual: KnowableUnknown<V>,
        assertion: Assertion<KnowableUnknown<V>>,
    ): Activity {
        return new Ensure<V>(actual, assertion);
    }

    constructor(
        private readonly actual: KnowableUnknown<T>,
        private readonly assertion: Assertion<KnowableUnknown<T>>,
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
                        `${ descriptionOf(actual) } should ${ this.assertion.describeShould(descriptionOf(expected)) }`,
                        this.assertion.expected,
                        this.actual,
                    );
                }
            });
    }

    toString() {
        return `#actor ensures that ${ descriptionOf(this.actual) } is ${ this.assertion.describeIs(descriptionOf(this.assertion.expected)) }`;
    }
}
