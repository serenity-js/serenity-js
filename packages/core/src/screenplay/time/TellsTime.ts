import type { Timestamp } from './models';

/**
 * Describes an {@apilink Actor} or a supporting class capable of telling
 * the current wall clock time.
 *
 * ## Learn more
 * - {@apilink Actor}
 * - {@apilink Serenity}
 * - {@apilink Stage}
 *
 * @group Time
 */
export interface TellsTime {
    /**
     * Returns current wall clock time.
     */
    currentTime(): Timestamp;
}
