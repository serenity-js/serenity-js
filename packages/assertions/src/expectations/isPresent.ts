import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, Optional } from '@serenity-js/core';

/**
 * @desc
 *  Expectation that the `actual` is not undefined or null.
 *  Also, for `actual` implementing {@link @serenity-js/core/lib/screenplay~Optional}, that `Optional.isPresent()` returns an {@link @serenity-js/core/lib/screenplay~Answerable}
 *  that resolves to `true`
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<Answerable<boolean>, Optional>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isPresent<Actual>(): Expectation<Actual> {
    return new IsPresent<Actual>();
}

class IsPresent<Actual> extends Expectation<Actual> {
    private static isOptional(value: any): value is Optional {
        return value !== undefined
            && value !== null
            && typeof value.isPresent === 'function';
    }

    private static valueToCheck<A>(actual: Answerable<A>, actor: AnswersQuestions): Answerable<A> {
        if (IsPresent.isOptional(actual)) {
            return actual;
        }

        return actor.answer(actual);
    }

    private static async isPresent<A>(value: Answerable<A>, actor: AnswersQuestions): Promise<boolean> {
        if (IsPresent.isOptional(value)) {
            return actor.answer(value.isPresent());
        }

        return value !== undefined
            && value !== null;
    }

    constructor() {
        super(
            'become present',
            async (actor: AnswersQuestions, actual: Answerable<Actual>) => {

                const value = await IsPresent.valueToCheck(actual, actor);

                const result = await IsPresent.isPresent(value, actor);

                return result
                    ? new ExpectationMet('become present', undefined, undefined)
                    : new ExpectationNotMet('become present', undefined, undefined);
            }
        );
    }
}
