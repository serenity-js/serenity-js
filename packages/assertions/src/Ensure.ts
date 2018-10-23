import { Activity, AnswersQuestions, AssertionError, Interaction, KnownUnknown, UsesAbilities } from '@serenity-js/core';
import { Assertion } from './assertions/Assertion';
import { descriptionOf } from './values';

export class Ensure<T> implements Interaction {

    static that<V>(
        actual: KnownUnknown<V>,
        assertion: Assertion<KnownUnknown<V>>,
    ): Activity {
        return new Ensure<V>(actual, assertion);
    }

    constructor(
        private readonly actual: KnownUnknown<T>,
        private readonly assertion: Assertion<KnownUnknown<T>>,
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
                        `Expected ${ descriptionOf(actual) } to ${ this.assertion.describeShould(descriptionOf(expected)) }`,
                        this.assertion.expected,
                        this.actual,
                    );
                }
            });
            // todo: add catch
    }

    toString() {
        return `#actor ensures that ${ descriptionOf(this.actual) } is ${ this.assertion.describeIs(descriptionOf(this.assertion.expected)) }`;
    }
}
