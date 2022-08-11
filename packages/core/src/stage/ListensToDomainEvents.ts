import { DomainEvent } from '../events';

/**
 * A {@link StageCrewMember} that can listen and react to {@link DomainEvent|DomainEvents}
 *
 * ## Learn more
 *
 * - {@link StageCrewMember}
 * - {@link StageCrewMemberBuilder}
 * - {@link configure}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Stage
 */
export interface ListensToDomainEvents {

    /**
     * Handles {@link DomainEvent} objects emitted by the {@link Stage}
     * that this {@link StageCrewMember} is assigned to.
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void;
}
