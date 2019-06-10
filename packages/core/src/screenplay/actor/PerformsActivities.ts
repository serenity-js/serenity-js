import { Activity } from '../Activity';

/**
 * @desc
 *  Enables the {@link Actor} to perform an {@link Activity}, such as a {@link Task} or an {@link Interaction}
 *
 * @public
 */
export interface PerformsActivities {
    attemptsTo(...tasks: Activity[]): Promise<void>;
}
