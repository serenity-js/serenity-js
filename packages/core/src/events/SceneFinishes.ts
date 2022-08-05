import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Outcome, ScenarioDetails, SerialisedOutcome, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * Emitted by a Serenity/JS test runner adapter, right before a test and all its associated test hooks finish.
 * Triggers any clean-up operations that might be required, such as discarding of the {@link Discardable} abilities.
 *
 * @group Events
 */
export class SceneFinishes extends DomainEvent {
    static fromJSON(o: JSONObject): SceneFinishes {
        return new SceneFinishes(
            CorrelationId.fromJSON(o.sceneId as string),
            ScenarioDetails.fromJSON(o.details as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly details: ScenarioDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('details', details, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
