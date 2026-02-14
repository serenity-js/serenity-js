import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../../model';
import { type SerialisedActor, Timestamp } from '../../screenplay';
import { DomainEvent } from '../DomainEvent';

/**
 * Emitted when an [`Actor`](https://serenity-js.org/api/core/class/Actor/) is first instantiated
 * as the result of invoking [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/).
 *
 * This event is emitted only once per actor, when they are first created.
 * Subsequent retrievals of the same actor do not emit this event.
 *
 * To track when the spotlight shifts to a different actor, listen for
 * [`ActorSpotlighted`](https://serenity-js.org/api/core-events/class/ActorSpotlighted/) instead.
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
