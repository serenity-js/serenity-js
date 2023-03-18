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

    constructor(private readonly checkTime: () => Date = () => new Date()) {
    }

    /**
     * Returns current time
     */
    now(): Timestamp {
        return new Timestamp(this.checkTime());
    }
}
