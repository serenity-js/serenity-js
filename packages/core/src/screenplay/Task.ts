import { ImplementationPendingError } from '../errors';
import { Activity } from './Activity';
import { PerformsActivities } from './actor';

/**
 * @desc
 *  Aggregates {@link Interaction}s so that they represents logical
 *  steps of a business process an {@link Actor} can perform.
 *
 * @implements {Activity}
 * @see {@link Interaction}
 * @see {@link Actor}
 */
export abstract class Task implements Activity {

    /**
     * @desc
     *  A factory method to make defining the Tasks more convenient.
     *  Please note that calling this method without providing the list of {@link Activity} objects
     *  will result in producing a Task that's marked as "pending" in the test report.
     *
     *  This feature is useful when you want to quickly write down a task that will be needed in the scenario,
     *  but you're not yet sure what activities will constitute it.
     *
     * @example <caption>Modelling a task</caption>
     * import { Log, Task } from '@serenity-js/core';
     *
     * const Debug = (something: Answerable<any>) =>
     *     Task.where(`#actor prints the answer to a question`,
     *          Log.the(something),
     *     );
     *
     * @example <caption>Modelling a not implemented task</caption>
     * import { Task } from '@serenity-js/core';
     *
     * const SignUp = () =>
     *     Task.where(`#actor signs up for a newsletter`); // no activities given
     *                                                     // => task marked as pending
     *
     * @param {string} description - A description to be used when reporting this task
     * @param {Activity[]} activities - A list of lower-level activities that constitute the task
     *
     * @returns {Task}
     */
    static where(description: string, ...activities: Activity[]): Task {
        return activities.length > 0
            ? new DynamicallyGeneratedTask(description, activities)
            : new NotImplementedTask(description);
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Task}.
     *
     * @param {PerformsActivities} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link PerformsActivities}
     */
    abstract performAs(actor: PerformsActivities): PromiseLike<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedTask extends Task {
    constructor(private description: string, private activities: Activity[]) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Task}.
     *
     * @param {PerformsActivities} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link PerformsActivities}
     */
    performAs(actor: PerformsActivities): PromiseLike<void> {
        return actor.attemptsTo(...this.activities);
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
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

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Task}.
     *
     * @param {PerformsActivities} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link PerformsActivities}
     */
    performAs(actor: PerformsActivities): PromiseLike<void> {
        return Promise.reject(
            new ImplementationPendingError(`A task where "${ this.toString() }" has not been implemented yet`),
        );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.description;
    }
}
