import { Activity } from './Activity';
import { PerformsTasks } from './actor';

export abstract class Task implements Activity {
    static where(description: string, ...activities: Activity[]): Task {
        // todo: if there are no activities, make it a PendingActivity
        return new AnonymousTask(description, activities);

        // return activities.length > 0
        //     ? new AnonymousTask(description, activities)
        //     : new PendingActivity();
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
