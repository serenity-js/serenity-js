import type { OutputStream } from '../adapter';
import type { DiffFormatter } from '../errors';
import type { Duration } from '../screenplay';
import type { Cast, StageCrewMember, StageCrewMemberBuilder } from '../stage';
import type { ClassDescription } from './ClassDescription';

/**
 * Describes the configuration object accepted by the [`configure`](https://serenity-js.org/api/core/function/configure/) function.
 *
 * ## Learn more
 * - [`configure`](https://serenity-js.org/api/core/function/configure/)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/)
 * - [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/)
 * - [`ClassDescription`](https://serenity-js.org/api/core/#ClassDescription)
 * - [`Stage.waitForNextCue`](https://serenity-js.org/api/core/class/Stage/#waitForNextCue)
 *
 * @group Serenity
 */
export abstract class SerenityConfig {

    /**
     * A [cast](https://serenity-js.org/api/core/class/Cast/) of [actors](https://serenity-js.org/api/core/class/Actor/) to be used when [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/)
     * and [`actorInTheSpotlight`](https://serenity-js.org/api/core/function/actorInTheSpotlight/) functions are called.
     */
    actors?: Cast;

    /**
     * A list of [stage crew member builders](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/) or [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/)
     * to be notified of [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) that occur during the scenario execution.
     *
     * Note that the `crew` can also be configured using [class descriptions](https://serenity-js.org/api/core/#ClassDescription).
     * This is useful when you need to load the configuration from a static `json` file, or when the test runner doesn't support
     * providing class instances in configuration (e.g. Playwright Test).
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder | ClassDescription>;

    /**
     * The maximum amount of time between [SceneFinishes](https://serenity-js.org/api/core-events/class/SceneFinishes/) and [SceneFinished](https://serenity-js.org/api/core-events/class/SceneFinished/) events
     * that Serenity/JS should wait for any post-scenario
     * async operations to complete. Those include generating the screenshots,
     * saving reports to disk, [dismissing the actors](https://serenity-js.org/api/core/interface/Discardable/), and so on.
     *
     * Defaults to 5 seconds.
     *
     * **Please note** that this is not
     * a scenario timeout, which should be configured in your test runner.
     */
    cueTimeout?: Duration;

    /**
     * The maximum default amount of time allowed for interactions such as [`Wait.until`](https://serenity-js.org/api/core/class/Wait/#until)
     * to complete.
     *
     * Defaults to 5 seconds, can be overridden per interaction.
     *
     * **Please note** that this is not
     * a scenario timeout, which should be configured in your test runner.
     *
     * #### Learn more
     * - [`Wait.until`](https://serenity-js.org/api/core/class/Wait/#until)
     */
    interactionTimeout?: Duration;

    /**
     * [`DiffFormatter`](https://serenity-js.org/api/core/interface/DiffFormatter/) that
     * should be used by the [`ErrorFactory`](https://serenity-js.org/api/core/class/ErrorFactory/) and the ability
     * to [`RaiseErrors`](https://serenity-js.org/api/core/class/RaiseErrors/)
     * when generating diffs included in [`RuntimeError`](https://serenity-js.org/api/core/class/RuntimeError/) objects.
     *
     * By default, Serenity/JS uses [`NoOpDiffFormatter`](https://serenity-js.org/api/core/class/NoOpDiffFormatter/)
     */
    diffFormatter?: DiffFormatter;

    /**
     * An output stream to be injected into [stage crew member builders](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/)
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     */
    outputStream?: OutputStream;
}
