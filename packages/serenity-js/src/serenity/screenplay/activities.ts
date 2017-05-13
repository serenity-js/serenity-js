import { AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';

export abstract class Task implements Activity {
    static where = (description: string, ...activities: Activity[]): Task => new AnonymousTask(description, activities);

    abstract performAs(actor: PerformsTasks): PromiseLike<void>;
}

export interface Interaction extends Activity {
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
}

export interface Activity {
    performAs(actor: PerformsTasks | UsesAbilities | AnswersQuestions): PromiseLike<void>;
}

class AnonymousTask implements Task {
    constructor(private description: string, private activities: Activity[]) {
    }

    performAs = (actor: PerformsTasks) => actor.attemptsTo(...this.activities);

    toString = () => this.description;
}
