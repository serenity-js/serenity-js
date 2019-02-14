import { Activity } from './Activity';
import { PerformsTasks } from './actor';

export abstract class Task implements Activity {
    static where(description: string, ...activities: Activity[]): Task {
        return new AnonymousTask(description, activities);
    }

    abstract performAs(actor: PerformsTasks): PromiseLike<void>;
}

class AnonymousTask implements Task {
    constructor(private description: string, private activities: Activity[]) {
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(...this.activities);
    }

    toString() {
        return this.description;
    }
}
