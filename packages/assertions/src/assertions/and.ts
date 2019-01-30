import { AnswersQuestions } from '@serenity-js/core';
import { Assertion } from './Assertion';

export function and<Actual>(...assertions: Array<Assertion<any, Actual>>): Assertion<any, Actual> {
    return new And(assertions);
}

class And<Actual> extends Assertion<any, Actual> {
    constructor(private readonly assertions: Array<Assertion<any, Actual>>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<void> {

        return (actual: any) =>
            this.assertions.reduce(
                (previous, current) => previous.then(() => current.answeredBy(actor)(actual)),
                Promise.resolve(void 0),
            );
    }

    toString(): string {
        return this.assertions.map(assertion => assertion.toString()).join(' and ');
    }
}
