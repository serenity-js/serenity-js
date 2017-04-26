import { Activity, Interaction, Task } from './activities';
import { AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';

export function task_where(description: string, ...activities: Activity[]): Task {
    return new AnonymousTask(description, activities);
}

class AnonymousTask implements Task {
    constructor(private description: string, private activities: Activity[]) {
    }

    performAs = (actor: PerformsTasks) => actor.attemptsTo(...this.activities);

    toString = () => this.description;
}
