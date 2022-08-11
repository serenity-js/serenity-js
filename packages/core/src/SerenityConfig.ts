import { OutputStream } from './adapter';
import { Duration } from './model';
import { Cast, StageCrewMember, StageCrewMemberBuilder } from './stage';

/**
 * Describes the configuration object accepted by the {@link configure} function.
 *
 * ## Learn more
 * - {@link configure}
 * - {@link Cast}
 * - {@link StageCrewMember}
 * - {@link StageCrewMemberBuilder}
 * - {@apilink Stage.waitForNextCue}
 *
 * @group Configuration
 */
export abstract class SerenityConfig {

    /**
     * A {@link Cast} of {@link Actor}s to be used when {@link actorCalled}
     * and {@link actorInTheSpotlight} functions are called.
     */
    actors?: Cast;

    /**
     * A list of {@link StageCrewMemberBuilder|StageCrewMemberBuilders} or {@link StageCrewMember|StageCrewMembers}
     * to be notified of {@link DomainEvent|DomainEvents} that occur during the scenario execution.
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder>;

    /**
     * The maximum amount of time Serenity/JS should wait for any post-scenario
     * async operations to complete. Those include generating the screenshots,
     * saving reports to disk and so on. **Please note** that this is not
     * a scenario timeout, which should be configured in your test runner.
     */
    cueTimeout?: Duration;

    /**
     * An output stream to be injected into {@link StageCrewMemberBuilder|StageCrewMemberBuilders}
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     */
    outputStream?: OutputStream;
}
