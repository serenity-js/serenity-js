import { ListensToDomainEvents } from './ListensToDomainEvents';
import { StageCrewMemberBuilderDependencies } from './StageCrewMemberBuilderDependencies';

/**
 * Use a {@apilink StageCrewMemberBuilder} to configure complex {@apilink StageCrewMember} objects.
 *
 * Useful when you're interested in implementing custom reporters with multiple configuration options.
 * See {@apilink ConsoleReporter} for an example.
 *
 * ## Learn more
 * - {@apilink StageCrewMember}
 * - {@apilink StageCrewMemberBuilderDependencies}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Stage
 */
export interface StageCrewMemberBuilder<T extends ListensToDomainEvents = ListensToDomainEvents> {

    /**
     * Instantiates a {@apilink StageCrewMember}, giving it access to shared dependencies
     * such as {@apilink Stage} or {@apilink OutputStream}
     */
    build(dependencies: StageCrewMemberBuilderDependencies): T;
}
