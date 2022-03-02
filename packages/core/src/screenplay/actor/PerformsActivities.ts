import { Activity } from '../Activity';

/**
 * @desc
 *  Enables the {@link Actor} to perform an {@link Activity},
 *  such as a {@link Task} or an {@link Interaction}
 *
 * @public
 */
export interface PerformsActivities {

    /**
     * @desc
     *  Makes the {@link Actor} attempt to perform a sequence of activities.
     *
     * @type {function(...activities: Activity[]): Promise<void>}
     * @public
     */
    attemptsTo: (...activities: Activity[]) => Promise<void>;
}
