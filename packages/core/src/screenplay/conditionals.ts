import { Activity, Interaction } from './activities';
import { Actor, AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';
import { Question } from './question';

export class SilentPerformable implements Interaction {
    performAs(actor: PerformsTasks | UsesAbilities | AnswersQuestions): PromiseLike<void> {
        return undefined;
    }
}

export abstract class ConditionalPerformable implements Activity {

    protected outcomeToPerform: { [key: string]: Activity[]; } = {};

    constructor() {
        this.outcomeToPerform['true'] = [new SilentPerformable()];
        this.outcomeToPerform['false'] = [new SilentPerformable()];
    }

    andIfSo = (...activities: Activity[]) => {
        this.outcomeToPerform['true'] = activities;
        return this;
    }

    otherwise = (...activities: Activity[]) => {
        this.outcomeToPerform['false'] = activities;
        return this;
    }

    abstract evaluatedConditionFor(actor: PerformsTasks): boolean;

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(...this.outcomeToPerform[this.evaluatedConditionFor(actor).toString()]);
    };
}

export abstract class ConditionalPerformablePromise implements Activity {

    protected outcomeToPerform: { [key: string]: Activity[]; } = {};

    constructor() {
        this.outcomeToPerform['true'] = [new SilentPerformable()];
        this.outcomeToPerform['false'] = [new SilentPerformable()];
    }

    andIfSo = (...activities: Activity[]) => {
        this.outcomeToPerform['true'] = activities;
        return this;
    }

    otherwise = (...activities: Activity[]) => {
        this.outcomeToPerform['false'] = activities;
        return this;
    }

    abstract evaluatedConditionFor(actor: PerformsTasks): PromiseLike<boolean>;

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return this.evaluatedConditionFor(actor).then(value => actor.attemptsTo(...this.outcomeToPerform[value.toString()]));
    };
}

class ConditionalPerformableOnBoolean extends ConditionalPerformable {

    constructor(private condition: boolean) {
        super();
    };

    evaluatedConditionFor(actor: Actor) {
        return this.condition;
    };
}

class ConditionalPerformableOnQuestion extends ConditionalPerformable {

    constructor(private condition: Question<boolean>) {
        super();
    };

    evaluatedConditionFor(actor: Actor) {
        return this.condition.answeredBy(actor);
    };

}

class ConditionalPerformableOnQuestionPromise extends ConditionalPerformablePromise {

    constructor(private condition: Question<PromiseLike<boolean>>) {
        super();
    };

    evaluatedConditionFor(actor: Actor) {
        return this.condition.answeredBy(actor);
    };

}

export class Check {
    static whether = (condition: boolean): ConditionalPerformable => new ConditionalPerformableOnBoolean(condition);
    static whetherQuestionTrue = (condition: Question<boolean>): ConditionalPerformable => new ConditionalPerformableOnQuestion(condition);
    static whetherPromiseTrue = (condition: Question<PromiseLike<boolean>>): ConditionalPerformablePromise => new ConditionalPerformableOnQuestionPromise(condition);
}
