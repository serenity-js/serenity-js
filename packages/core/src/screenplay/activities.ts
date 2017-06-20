import { AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';

export abstract class Task implements Activity {
    static where = (description: string, ...activities: Activity[]): Task => new AnonymousTask(description, activities);

    abstract performAs(actor: PerformsTasks): PromiseLike<void>;
}

export abstract class Interaction implements Activity {
    static where = (description: string, interaction: (actor: UsesAbilities & AnswersQuestions) => PromiseLike<void>): Interaction =>
        new AnonymousInteraction(description, interaction);

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
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

class AnonymousInteraction implements Interaction {
    constructor(private description: string, private interaction: (actor: UsesAbilities & AnswersQuestions) => PromiseLike<void>) {
    }

    performAs = (actor: UsesAbilities & AnswersQuestions) => this.interaction(actor);

    toString = () => this.description;
}
