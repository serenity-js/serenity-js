import { Answerable, AnswersQuestions, d, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

export function containItemsWhereEachItem<Actual>(expectation: Expectation<Actual>): Expectation<Actual[]> {
    return new ContainItemsWhereEachItemMeetsExpectation(expectation);
}

/**
 * @package
 */
class ContainItemsWhereEachItemMeetsExpectation<Actual> extends Expectation<Actual[]> {

    private static descriptionFor(expectation: Expectation<any>) {
        return d`contain items where each item does ${ expectation }`;
    }

    constructor(private readonly expectation: Expectation<Actual>) {
        super(
            ContainItemsWhereEachItemMeetsExpectation.descriptionFor(expectation),
            async (actor: AnswersQuestions, actual: Answerable<Actual[]>) => {

                const items: Actual[] = await actor.answer(actual);

                if (! items || items.length === 0) {
                    return new ExpectationNotMet(
                        ContainItemsWhereEachItemMeetsExpectation.descriptionFor(expectation),
                        undefined,
                        items,
                    );
                }

                let outcome: ExpectationOutcome<unknown, Actual>;

                for (const item of items) {

                    outcome = await actor.answer(expectation.isMetFor(item))

                    if (outcome instanceof ExpectationNotMet) {
                        return new ExpectationNotMet(
                            ContainItemsWhereEachItemMeetsExpectation.descriptionFor(expectation),
                            outcome.expected,
                            items
                        );
                    }
                }

                return new ExpectationMet(ContainItemsWhereEachItemMeetsExpectation.descriptionFor(expectation), outcome.expected, items);
            }
        );
    }
}
