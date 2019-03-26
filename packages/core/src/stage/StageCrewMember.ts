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
 *
 * @interface
 */
export abstract class StageCrewMember {

    /**
     * @param {Stage} stage
     */
    abstract assignedTo(stage: Stage): StageCrewMember;

    /**
     * @param {DomainEvent} event
     */
    abstract notifyOf(event: DomainEvent): void;
}
