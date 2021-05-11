import { OutputStream } from './io';
import { Duration } from './model';
import { Cast, StageCrewMember, StageCrewMemberBuilder } from './stage';

/**
 * @interface
 *
 * @see {@link configure}
 */
export abstract class SerenityConfig {
    /**
     * @desc
     *  A {@link Cast} of {@link Actor}s to be used when {@link actorCalled}
     *  and {@link actorInTheSpotlight} functions are called.
     *
     * @type {?Cast}
     */
    actors?:        Cast;

    /**
     * @desc
     *  A list of {@link StageCrewMemberBuilder}s or {@link StageCrewMember}s
     *  to be notified of {@link DomainEvent}s that occur during the scenario execution.
     *
     * @type {?Array<StageCrewMember | StageCrewMemberBuilder>}
     */
    crew?:          Array<StageCrewMember | StageCrewMemberBuilder>;

    /**
     * @desc
     *  The maximum amount of time Serenity/JS should wait for any post-scenario
     *  async operations to complete. Those include generating the screenshots,
     *  saving reports to disk and so on. **Please note** that this is not
     *  a scenario timeout, which should be configured in your test runner.
     *
     * @type {?Duration}
     */
    cueTimeout?:    Duration;

    /**
     * @desc
     *  An output stream to be injected into {@link StageCrewMemberBuilder}s
     *
     *  Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     *
     * @type {?OutputStream}
     */
    outputStream?: OutputStream;
}
