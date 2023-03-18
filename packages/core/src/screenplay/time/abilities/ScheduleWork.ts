import { Ability, Discardable, Initialisable } from '../../abilities';
import { Clock, DelayedCallback, Duration, RepeatUntilLimits, Scheduler } from '../models';

/**
 * An {@apilink Ability} that enables an {@apilink Actor} to schedule a callback function
 * to be executed with a delay, or until some condition is met.
 *
 * Used internally by the {@apilink Interaction|interaction} to {@apilink Wait}.
 *
 * @experimental
 *
 * @group Time
 */
export class ScheduleWork extends Ability implements Initialisable, Discardable {

    private readonly scheduler: Scheduler;

    constructor(clock: Clock, interactionTimeout: Duration) {
        super();
        this.scheduler = new Scheduler(clock, interactionTimeout);
    }

    initialise(): void {
        this.scheduler.start();
    }

    isInitialised(): boolean {
        return this.scheduler.isRunning();
    }

    /**
     * @param callback
     * @param limits
     */
    repeatUntil<Result>(
        callback: DelayedCallback<Result>,
        limits?: RepeatUntilLimits<Result>,
    ): Promise<Result> {
        return this.scheduler.repeatUntil(callback, limits);
    }

    waitFor(delay: Duration): Promise<void> {
        this.scheduler.start();
        return this.scheduler.after(delay, () => {
            // do nothing
        })
    }

    discard(): void {
        this.scheduler.stop();
    }
}
