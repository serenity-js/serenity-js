import { Activity, Answerable, AnswersQuestions, PerformsActivities, Task } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Expectation } from './Expectation';
import { ExpectationMet } from './outcomes';

export class Check<Actual> extends Task {
    static whether<A>(actual: Answerable<A>, expectation: Expectation<any, A>) {
        return {
            andIfSo: (...activities: Activity[]) => new Check(actual, expectation, activities),
        };
    }

    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<any, Actual>,
        private readonly activities: Activity[],
        private readonly alternativeActivities: Activity[] = [],
    ) {
        super();
    }

    otherwise(...alternativeActivities: Activity[]) {
        return new Check<Actual>(this.actual, this.expectation, this.activities, alternativeActivities);
    }

    performAs(actor: AnswersQuestions & PerformsActivities): PromiseLike<void> {
        return Promise.all([
            actor.answer(this.actual),
            actor.answer(this.expectation),
        ]).then(([actual, expectation]) =>
            expectation(actual).then(outcome =>
                    outcome instanceof ExpectationMet
                        ? actor.attemptsTo(...this.activities)
                        : actor.attemptsTo(...this.alternativeActivities),
            ),
        );
    }

    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
    }
}
