import { Activity, AnswersQuestions, KnowableUnknown, PerformsTasks, Task } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { match } from 'tiny-types';
import { Expectation } from './Expectation';
import { ExpectationMet, ExpectationNotMet, Outcome } from './outcomes';

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
                match<Outcome<any, Actual>, void>(outcome)
                    .when(ExpectationMet,       o => actor.attemptsTo(...this.activities))
                    .when(ExpectationNotMet,    o => actor.attemptsTo(...this.alternativeActivities))
                    .else(_ => void 0),
            ),
        );
    }

    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
    }
}
