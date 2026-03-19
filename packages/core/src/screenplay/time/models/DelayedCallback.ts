import type { Timestamp } from './Timestamp.js';

/**
 * @group Time
 */
export interface DelayedCallback<Result> {
    (stats: { currentTime: Timestamp, i: number }): Promise<Result> | Result;
}
