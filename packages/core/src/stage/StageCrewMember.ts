import { DomainEvent } from '../events';
import { Stage } from './Stage';
import { StageManager } from './StageManager';

/**
 * @desc
 *  You can think of the {@link StageCrewMember} as an in-memory micro-service that reacts to {@link DomainEvent}s
 *  from the {@link StageManager}. Every {@link StageCrewMember} receives a reference to the {@link Stage},
 *  and therefore {@link StageManager} as well, which enables them to emit {@link DomainEvent}s back.
 *
 *  Useful when you're interested in implementing custom reporters.
 */
export interface StageCrewMember {

    /**
     * @desc
     *  Creates a new instance of this {@link StageCrewMember} and assigns it to a given {@link Stage}.
     *
     * @param {Stage} stage - An instance of a {@link Stage} this {@link StageCrewMember} will be assigned to
     * @returns {StageCrewMember} - A new instance of this {@link StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember;

    /**
     * @desc
     *  Handles {@link DomainEvent} objects emitted by the {@link Stage}
     *  this {@link StageCrewMember} is assigned to.
     *
     * @param {DomainEvent} event
     * @returns void
     */
    notifyOf(event: DomainEvent): void;
}
