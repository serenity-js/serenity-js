import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../../model';
import { type SerialisedActor, Timestamp } from '../../screenplay';
import { DomainEvent } from '../DomainEvent';

/**
 * Emitted when an [`Actor`](https://serenity-js.org/api/core/class/Actor/) is activated
 * as the result of invoking [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/).
 *
 * @group Events
 */
export class ActorEntersStage extends DomainEvent {
    public static fromJSON(o: JSONObject): ActorEntersStage {
        return new ActorEntersStage(
            CorrelationId.fromJSON(o.sceneId as string),
            o.actor as unknown as SerialisedActor,
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly actor: SerialisedActor,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('actor', actor, isDefined());
    }
}
