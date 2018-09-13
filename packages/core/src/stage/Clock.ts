import { Timestamp } from '../model';

/**
 * @desc A {@link Clock} tells the time.
 *
 * @example
 * const now: Timestamp = new Clock().now()
 */
export class Clock {
    /**
     * @returns {Timestamp} current time
     */
    now(): Timestamp {
        return new Timestamp();
    }
}
