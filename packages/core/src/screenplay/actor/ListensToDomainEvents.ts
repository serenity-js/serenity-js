import { DomainEvent } from '../../events';

/**
 * @desc
 *  A {@link StageCrewMember} or an {@link Actor} that can listen and react to
 *  {@link DomainEvent}s
 */
export interface ListensToDomainEvents {

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
