import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

export function property<Actual, Property extends keyof Actual>(
    propertyName: Property,
    expectation: Expectation<any, Actual[Property]>,
): Expectation<Actual[Property], Actual> {
    return new HasProperty(propertyName, expectation);
}

/**
 * @package
 */
class HasProperty<Property extends keyof Actual, Actual> extends Expectation<Actual[Property], Actual> {
    constructor(
        private readonly propertyName: Property,
        private readonly expectation: Expectation<any, Actual[Property]>,
    ) {
        super(formatted `have property ${ propertyName } that does ${ expectation }`);
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<ExpectationOutcome<Actual[Property], any>> {

        return (actual: Actual) =>
            this.expectation.answeredBy(actor)(actual[this.propertyName])
                .then((outcome: ExpectationOutcome<any, Actual[Property]>) => {

                    return outcome instanceof ExpectationMet
                        ? new ExpectationMet(this.toString(), outcome.expected, actual[this.propertyName])
                        : new ExpectationNotMet(this.toString(), outcome.expected, actual[this.propertyName]);
                });
    }
}
