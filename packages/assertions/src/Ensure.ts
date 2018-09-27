import { Activity, AnswersQuestions, AssertionError, Interaction, UsesAbilities } from '@serenity-js/core';
import { Assertion } from './assertions/Assertion';
import { descriptionOf, extracted, ValueOf } from './values';

export class Ensure<T> implements Interaction {

    static that<V>(
        actual: ValueOf<V>,
        assertion: Assertion<ValueOf<V>>,
    ): Activity {
        return new Ensure<V>(actual, assertion);
    }

    constructor(
        private readonly actual: ValueOf<T>,
        private readonly assertion: Assertion<ValueOf<T>>,
    ) {
    }

    performAs(actor: AnswersQuestions & UsesAbilities): Promise<void> {
        return Promise.all([
                extracted(this.actual, actor),
                extracted(this.assertion.expected, actor),
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
