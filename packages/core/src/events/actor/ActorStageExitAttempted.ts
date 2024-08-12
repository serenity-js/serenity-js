import type {JSONObject } from 'tiny-types';
import { ensure, isPlainObject } from 'tiny-types';

import { CorrelationId, Description, Name } from '../../model';
import { type Actor, Timestamp } from '../../screenplay';
import { AsyncOperationAttempted } from '../AsyncOperationAttempted';

/**
 * Emitted when an [`Actor`](https://serenity-js.org/api/core/class/Actor/) is dismissed
 * either upon the [`SceneFinishes`](https://serenity-js.org/api/core-events/class/SceneFinishes/) event
 * for actors initialised within the scope of a test scenario,
 * or upon the [`TestRunFinishes`](https://serenity-js.org/api/core-events/class/TestRunFinishes/) event
 * for actors initialised within the scope of a test suite.
 *
 * @group Events
 */
export class ActorStageExitAttempted extends AsyncOperationAttempted {
    static fromJSON(o: JSONObject): ActorStageExitAttempted {
        return new ActorStageExitAttempted(
            Name.fromJSON(o.name as string),
            o.actor as ReturnType<Actor['toJSON']>,
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        name: Name,
        public readonly actor: ReturnType<Actor['toJSON']>,
        correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(name, new Description(`Actor ${ actor.name } exits the stage`), correlationId, timestamp);
        ensure('actor', actor, isPlainObject());
    }
}
