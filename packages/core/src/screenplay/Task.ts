import { ImplementationPendingError } from '../errors';
import { Activity } from './Activity';
import { PerformsTasks } from './actor';

export abstract class Task implements Activity {
    static where(description: string, ...activities: Activity[]): Task {
        return activities.length > 0
            ? new DynamicallyGeneratedTask(description, activities)
            : new NotImplementedTask(description);
    }

    abstract performAs(actor: PerformsTasks): PromiseLike<void>;
}

class DynamicallyGeneratedTask extends Task {
    constructor(private description: string, private activities: Activity[]) {
        super();
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(...this.activities);
    }

    toString() {
        return this.description;
    }
}

class NotImplementedTask extends Task {
    constructor(private description: string) {
        super();
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return Promise.reject(
            new ImplementationPendingError(`A task where "${ this.toString() }" has not been implemented yet`),
        );
    }

    toString() {
        return this.description;
    }
}
