import type { Discardable } from '../../abilities';
import { Ability } from '../../abilities';
import type { Clock, DelayedCallback, Duration, RepeatUntilLimits} from '../models';
import { Scheduler } from '../models';

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
export class ScheduleWork extends Ability implements Discardable {

    private readonly scheduler: Scheduler;

    constructor(clock: Clock, interactionTimeout: Duration) {
        super();
        this.scheduler = new Scheduler(clock, interactionTimeout);
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
        return this.scheduler.waitFor(delay);
    }

    discard(): void {
        this.scheduler.stop();
    }
}
