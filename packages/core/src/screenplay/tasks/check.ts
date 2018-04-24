import { Activity, Task } from '../activities';
import { PerformsTasks, UsesAbilities } from '../actor';
import { Question } from '../question';

const
    isBoolean  = (v: any): v is boolean => v === true || v === false,
    isQuestion = (v: any): v is Question<any> => !! v.answeredBy;

export abstract class Check {
    static whether(condition: boolean | Question<boolean> | Question<PromiseLike<boolean>>) {
        return ({
            andIfSo: (...activities: Activity[]): Activity & Check => {
                if (isBoolean(condition)) {
                    return new ActivitiesConditionalOnBoolean(condition, activities, []);
                }
                if (isQuestion(condition)) {
                    return new ActivitiesConditionalOnQuestion(condition, activities, []);
                }
            },
        });
    }

    abstract otherwise(...activities: Activity[]): Activity & Check;
}

class ActivitiesConditionalOnBoolean implements Task, Check {
    constructor(private readonly condition: boolean,
                private readonly activitiesWhenConditionIsMet: Activity[],
                private readonly activitiesWhenConditionIsNotMet: Activity[]) {
    }

    otherwise(...activities: Activity[]): Activity & Check {
        return new ActivitiesConditionalOnBoolean(this.condition, this.activitiesWhenConditionIsMet, activities);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(...(this.condition
                ? this.activitiesWhenConditionIsMet
                : this.activitiesWhenConditionIsNotMet
        ));
    }
}

class ActivitiesConditionalOnQuestion implements Task, Check {
    constructor(private readonly condition: Question<boolean> | Question<PromiseLike<boolean>>,
                private readonly activitiesWhenConditionIsMet: Activity[],
                private readonly activitiesWhenConditionIsNotMet: Activity[]) {
    }

    otherwise(...activities: Activity[]): Activity & Check {
        return new ActivitiesConditionalOnQuestion(this.condition, this.activitiesWhenConditionIsMet, activities);
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        const answer = this.condition.answeredBy(actor);

        if (isBoolean(answer)) {
            return actor.attemptsTo(...(answer
                    ? this.activitiesWhenConditionIsMet
                    : this.activitiesWhenConditionIsNotMet
            ));
        }

        return answer.then(result => actor.attemptsTo(...(result
            ? this.activitiesWhenConditionIsMet
            : this.activitiesWhenConditionIsNotMet
        )));
    }
}
