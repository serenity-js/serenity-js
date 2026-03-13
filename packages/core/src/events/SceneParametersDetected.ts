import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId, ScenarioDetails, ScenarioParameters } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
export class SceneParametersDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): SceneParametersDetected {
        return new SceneParametersDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            ScenarioDetails.fromJSON(o.details as JSONObject),
            ScenarioParameters.fromJSON(o.parameters as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly details: ScenarioDetails,
        public readonly parameters: ScenarioParameters,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('details', details, isDefined());
        ensure('parameters', parameters, isDefined());
    }
}
