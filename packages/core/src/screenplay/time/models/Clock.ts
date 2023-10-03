import { ensure, isDefined } from 'tiny-types';

import { Duration } from './Duration';
import { Timestamp } from './Timestamp';

/**
 * A {@apilink Clock} tells the time. This abstraction allows Serenity/JS to have a single place
 * in the framework responsible for telling the time, and one that can be easily mocked for internal testing.
 *
 * ```ts
 * const now: Timestamp = new Clock().now()
 * ```
 *
 * ## Learn more
 * - {@apilink Timestamp}
 * - {@apilink Duration}
 *
 * @group Time
 */
export class Clock {
    private static resolution: Duration = Duration.ofMilliseconds(10);
    private timeAdjustment: Duration = Duration.ofMilliseconds(0);

    constructor(private readonly checkTime: () => Date = () => new Date()) {
    }

    /**
     * Sets the clock ahead to force early resolution of promises
     * returned by {@apilink Clock.waitFor};
     *
     * Useful for test purposes to avoid unnecessary delays.
     *
     * @param duration
     */
    setAhead(duration: Duration): void {
        this.timeAdjustment = ensure('duration', duration, isDefined());
    }

    /**
     * Returns a Promise that resolves after one tick of the clock.
     *
     * Useful for test purposes to avoid unnecessary delays.
     */
    async tick(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, Clock.resolution.inMilliseconds()));
    }

    /**
     * Returns current time
     */
    now(): Timestamp {
        return new Timestamp(this.checkTime()).plus(this.timeAdjustment);
    }

    /**
     * Returns a Promise that will be resolved after the given duration
     *
     * @param duration
     */
    async waitFor(duration: Duration): Promise<void> {
        const stopAt = this.now().plus(duration);

        let timer: NodeJS.Timeout;

        return new Promise<void>(resolve => {
            timer = setInterval(() => {
                if (this.now().isAfterOrEqual(stopAt)) {
                    clearInterval(timer);
                    return resolve();
                }
            }, Clock.resolution.inMilliseconds());
        });
    }
}
