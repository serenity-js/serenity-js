import { Duration } from './model';
import { Cast, StageCrewMember } from './stage';

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
     *  A list of {@link StageCrewMember}s to be notified of {@link DomainEvent}s
     *  that occur during the scenario execution.
     *
     * @type {?StageCrewMember[]}
     */
    crew?:          StageCrewMember[];

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
}
