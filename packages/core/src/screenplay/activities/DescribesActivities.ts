import type { Answerable } from '../Answerable';
import type { Describable } from '../Describable';
import type { Description } from '../Description';

/**
 * {@apilink Actor} who can describe a {@apilink Describable|describable} {@apilink Question} or {@apilink Activity}.
 *
 * ## Learn more
 * - {@apilink Activity}
 * - {@apilink Interaction}
 * - {@apilink Task}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface DescribesActivities {

    /**
     * Makes the {@apilink Actor} describe a {@apilink Describable|describable} {@apilink Question} or {@apilink Activity}
     */
    describe(describable: Describable | Answerable<any>): Promise<Description>;
}
