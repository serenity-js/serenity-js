import { OutputStream } from '../adapter';
import { DiffFormatter } from '../errors';
import { Duration } from '../screenplay';
import { Cast, StageCrewMember, StageCrewMemberBuilder } from '../stage';
import { ClassDescription } from './ClassDescription';

/**
 * Describes the configuration object accepted by the {@apilink configure} function.
 *
 * ## Learn more
 * - {@apilink configure}
 * - {@apilink Cast}
 * - {@apilink StageCrewMember}
 * - {@apilink StageCrewMemberBuilder}
 * - {@apilink ClassDescription}
 * - {@apilink Stage.waitForNextCue}
 *
 * @group Serenity
 */
export abstract class SerenityConfig {

    /**
     * A {@apilink Cast} of {@apilink Actor}s to be used when {@apilink actorCalled}
     * and {@apilink actorInTheSpotlight} functions are called.
     */
    actors?: Cast;

    /**
     * A list of {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders} or {@apilink StageCrewMember|StageCrewMembers}
     * to be notified of {@apilink DomainEvent|DomainEvents} that occur during the scenario execution.
     *
     * Note that the `crew` can also be configured using {@apilink ClassDescription|ClassDescriptions}.
     * This is useful when you need to load the configuration from a static `json` file, or when the test runner doesn't support
     * providing class instances in configuration (e.g. Playwright Test).
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder | ClassDescription>;

    /**
     * The maximum amount of time between {@apilink SceneFinishes} and {@apilink SceneFinished} events
     * that Serenity/JS should wait for any post-scenario
     * async operations to complete. Those include generating the screenshots,
     * saving reports to disk, {@apilink Discardable|dismissing the actors}, and so on.
     *
     * Defaults to 5 seconds.
     *
     * **Please note** that this is not
     * a scenario timeout, which should be configured in your test runner.
     */
    cueTimeout?: Duration;

    /**
     * The maximum default amount of time allowed for interactions such as {@apilink Wait.until}
     * to complete.
     *
     * Defaults to 5 seconds, can be overridden per interaction.
     *
     * **Please note** that this is not
     * a scenario timeout, which should be configured in your test runner.
     *
     * #### Learn more
     * - {@apilink Wait.until}
     */
    interactionTimeout?: Duration;

    /**
     * {@apilink DiffFormatter} that should be used by the {@apilink ErrorFactory} and the ability to {@apilink RaiseErrors}
     * when generating diffs included in {@apilink RuntimeError} objects.
     *
     * By default, Serenity/JS uses {@apilink NoOpDiffFormatter}.
     */
    diffFormatter?: DiffFormatter;

    /**
     * An output stream to be injected into {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders}
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     */
    outputStream?: OutputStream;
}
