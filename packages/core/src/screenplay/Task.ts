import { ImplementationPendingError } from '../errors';
import { Activity } from './Activity';
import { PerformsActivities } from './actor';

export abstract class Task implements Activity {
    static where(description: string, ...activities: Activity[]): Task {
        return activities.length > 0
            ? new DynamicallyGeneratedTask(description, activities)
            : new NotImplementedTask(description);
    }

    abstract performAs(actor: PerformsActivities): PromiseLike<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedTask extends Task {
    constructor(private description: string, private activities: Activity[]) {
        super();
    }

    performAs(actor: PerformsActivities): PromiseLike<void> {
        return actor.attemptsTo(...this.activities);
    }

    toString() {
        return this.description;
    }
}

/**
 * @package
 */
class NotImplementedTask extends Task {
    constructor(private description: string) {
        super();
    }

    performAs(actor: PerformsActivities): PromiseLike<void> {
        return Promise.reject(
            new ImplementationPendingError(`A task where "${ this.toString() }" has not been implemented yet`),
        );
    }

    toString() {
        return this.description;
    }
}
