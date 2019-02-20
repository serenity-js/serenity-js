import { Activity, AnswersQuestions, KnowableUnknown, PerformsTasks, Task } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Expectation } from './Expectation';
import { ExpectationMet } from './outcomes';

export class Check<Actual> implements Task {
    static whether<A>(actual: KnowableUnknown<A>, expectation: Expectation<any, A>) {
        return {
            andIfSo: (...activities: Activity[]) => new Check(actual, expectation, activities),
        };
    }

    constructor(
        private readonly actual: KnowableUnknown<Actual>,
        private readonly expectation: Expectation<any, Actual>,
        private readonly activities: Activity[],
        private readonly alternativeActivities: Activity[] = [],
    ) {
    }

    otherwise(...alternativeActivities: Activity[]) {
        return new Check<Actual>(this.actual, this.expectation, this.activities, alternativeActivities);
    }

    performAs(actor: AnswersQuestions & PerformsTasks): PromiseLike<void> {
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
