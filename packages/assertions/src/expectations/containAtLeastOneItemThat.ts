import { Answerable, AnswersQuestions, d, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

export function containAtLeastOneItemThat<Actual>(expectation: Expectation<Actual>): Expectation<Actual[]> {
    return new ContainAtLeastOneItemThatMeetsExpectation(expectation);
}

/**
 * @package
 */
class ContainAtLeastOneItemThatMeetsExpectation<Actual> extends Expectation<Actual[]> {

    private static descriptionFor(expectation: Expectation<any>) {
        return d`contain at least one item that does ${ expectation }`;
    }

    constructor(private readonly expectation: Expectation<Actual>) {
        super(
            ContainAtLeastOneItemThatMeetsExpectation.descriptionFor(expectation),
            async (actor: AnswersQuestions, actual: Answerable<Actual[]>) => {

                const items: Actual[] = await actor.answer(actual);

                if (! items || items.length === 0) {
                    return new ExpectationNotMet(
                        ContainAtLeastOneItemThatMeetsExpectation.descriptionFor(expectation),
                        undefined,
                        items,
                    );
                }

                let outcome: ExpectationOutcome<unknown, Actual>;

                for (const item of items) {

                    outcome = await actor.answer(expectation.isMetFor(item))

                    if (outcome instanceof ExpectationMet) {
                        return new ExpectationMet(
                            ContainAtLeastOneItemThatMeetsExpectation.descriptionFor(expectation),
                            outcome.expected,
                            items
                        );
                    }
                }

                return new ExpectationNotMet(ContainAtLeastOneItemThatMeetsExpectation.descriptionFor(expectation), outcome.expected, items);
            }
        );
    }
}
