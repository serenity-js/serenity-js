import { Activity } from '../Activity';

/**
 * Describes an {@apilink Actor} who can perform a sequence of {@apilink Activity|Activities},
 * such as {@apilink Task|tasks} or {@apilink Interaction|interactions}.
 *
 * ## Learn more
 * - {@apilink Activity}
 * - {@apilink Interaction}
 * - {@apilink Task}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface PerformsActivities {

    /**
     * Makes the {@apilink Actor} attempt to perform a sequence of {@apilink Activity|Activities}.
     */
    attemptsTo: (...activities: Activity[]) => Promise<void>;
}
