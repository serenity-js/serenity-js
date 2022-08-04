import { Timestamp } from '../model';

/**
 * A {@link Clock} tells the time. This abstraction allows Serenity/JS to have a single place
 * in the framework responsible for telling the time, that can also be easily mocked for internal testing.
 *
 * ```ts
 * const now: Timestamp = new Clock().now()
 * ```
 *
 * ## Learn more
 * - {@link Timestamp}
 * - {@link Duration}
 *
 * @group Stage
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
