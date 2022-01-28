import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet } from '@serenity-js/core';

export function not<Actual>(assertion: Expectation<Actual>): Expectation<Actual> {
    return new Not<Actual>(assertion);
}

/**
 * @package
 */
class Not<Actual> extends Expectation<Actual> {
    private static flipped(message: string): string {
        return message.startsWith('not ')
            ? message.slice(4)
            : `not ${ message }`;
    }

    constructor(private readonly expectation: Expectation<Actual>) {
        super(
            Not.flipped(expectation.toString()),
            async (actor: AnswersQuestions, actual: Answerable<Actual>) => {
                const subject = Not.flipped(expectation.toString());

                const outcome = await actor.answer(expectation.isMetFor(actual));

                return outcome instanceof ExpectationNotMet
                    ? new ExpectationMet(subject, outcome.expected, outcome.actual)
                    : new ExpectationNotMet(subject, outcome.expected, outcome.actual);
            }
        );
    }
}
