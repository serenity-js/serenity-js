import { DomainEvent } from '../events';

/**
 * A {@apilink StageCrewMember} that can listen and react to {@apilink DomainEvent|DomainEvents}
 *
 * ## Learn more
 *
 * - {@apilink StageCrewMember}
 * - {@apilink StageCrewMemberBuilder}
 * - {@apilink configure}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Stage
 */
export interface ListensToDomainEvents {

    /**
     * Handles {@apilink DomainEvent} objects emitted by the {@apilink Stage}
     * that this {@apilink StageCrewMember} is assigned to.
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void;
}
