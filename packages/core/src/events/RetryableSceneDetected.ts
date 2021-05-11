import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @desc
 *  Indicates that the test runner will retry running the test scenario upon failure.
 *
 * @extends {DomainEvent}
 */
export class RetryableSceneDetected extends DomainEvent {

    /**
     * @desc
     *  Deserialises the event from a JSONObject
     *
     * @param {tiny-types~JSONObject} o
     * @returns {RetryableSceneDetected}
     */
    static fromJSON(o: JSONObject): RetryableSceneDetected {
        return new RetryableSceneDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    /**
     * @param {CorrelationId} sceneId
     * @param {Timestamp} [timestamp]
     */
    constructor(
        public readonly sceneId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
    }
}
