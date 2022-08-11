import { ListensToDomainEvents } from './ListensToDomainEvents';
import { StageCrewMemberBuilderDependencies } from './StageCrewMemberBuilderDependencies';

/**
 * Use a {@link StageCrewMemberBuilder} to configure complex {@link StageCrewMember} objects.
 *
 * Useful when you're interested in implementing custom reporters with multiple configuration options.
 * See {@link ConsoleReporter} for an example.
 *
 * ## Learn more
 * - {@link StageCrewMember}
 * - {@link StageCrewMemberBuilderDependencies}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Stage
 */
export interface StageCrewMemberBuilder<T extends ListensToDomainEvents = ListensToDomainEvents> {

    /**
     * Instantiates a {@link StageCrewMember}, giving it access to shared dependencies
     * such as {@link Stage} or {@link OutputStream}
     */
    build(dependencies: StageCrewMemberBuilderDependencies): T;
}
