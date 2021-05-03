import { DomainEvent } from '../events';

/**
 * @desc
 *  A {@link StageCrewMember} that can listen and react to {@link DomainEvent}s
 *
 * @see {@link StageCrewMember}
 * @see {@link StageCrewMemberBuilder}
 * @see {@link Serenity#configure}
 * @see {@link SerenityConfig#crew}
 */
export interface ListensToDomainEvents {

    /**
     * @desc
     *  Handles {@link DomainEvent} objects emitted by the {@link Stage}
     *  that this {@link StageCrewMember} is assigned to.
     *
     * @type {function(event: DomainEvent): void}
     */
    notifyOf: (event: DomainEvent) => void;
}
