import { ListensToDomainEvents } from './ListensToDomainEvents';
import { StageCrewMemberBuilderDependencies } from './StageCrewMemberBuilderDependencies';

/**
 * @desc
 *  Use a {@link StageCrewMemberBuilder} to configure complex {@link StageCrewMember} objects.
 *  Useful when you're interested in implementing custom reporters with multiple configuration options.
 *
 * @see {@link StageCrewMember}
 * @see {@link StageCrewMemberBuilderDependencies}
 * @see {@link SerenityConfig#crew}
 */
export interface StageCrewMemberBuilder<T extends ListensToDomainEvents = ListensToDomainEvents> {

    /**
     * @desc
     *  Instantiates a {@link StageCrewMember}, giving it access to shared dependencies
     *  such as {@link Stage} or {@link OutputStream}
     *
     * @type {function(dependencies: StageCrewMemberBuilderDependencies): T}
     */
    build: (dependencies: StageCrewMemberBuilderDependencies) => T;
}
