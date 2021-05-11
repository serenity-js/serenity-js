import { ListensToDomainEvents } from './ListensToDomainEvents';
import { Stage } from './Stage';

/**
 * @desc
 *  You can think of the {@link StageCrewMember} as an in-memory micro-service that reacts to {@link DomainEvent}s
 *  from the {@link StageManager}.
 *
 *  Every {@link StageCrewMember} receives a reference to the {@link Stage},
 *  and therefore {@link StageManager} as well, which enables them to emit {@link DomainEvent}s back.
 *
 *  Useful when you're interested in implementing [custom reporters](/handbook/reporting/index.html).
 *
 * @extends {ListensToDomainEvents}
 * @see {@link StageCrewMemberBuilder}
 * @see {@link SerenityConfig#crew}
 */
export interface StageCrewMember extends ListensToDomainEvents {

    /**
     * @desc
     *  Assigns a {@link Stage} to this {@link StageCrewMember}
     *
     * @type {function(stage: Stage): StageCrewMember}
     *  An instance of a {@link Stage} this {@link StageCrewMember} will be assigned to
     */
    assignedTo: (stage: Stage) => StageCrewMember;
}
