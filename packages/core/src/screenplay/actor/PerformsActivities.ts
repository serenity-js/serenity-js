import { Activity } from '../Activity';

/**
 * Describes an {@link Actor} who can perform a sequence of {@link Activity|Activities},
 * such as {@link Task|tasks} or {@link Interaction|interactions}.
 *
 * ## Learn more
 * - {@link Activity}
 * - {@link Interaction}
 * - {@link Task}
 * - {@link Actor}
 *
 * @group Actors
 */
export interface PerformsActivities {

    /**
     * Makes the {@link Actor} attempt to perform a sequence of {@link Activity|Activities}.
     */
    attemptsTo: (...activities: Activity[]) => Promise<void>;
}
