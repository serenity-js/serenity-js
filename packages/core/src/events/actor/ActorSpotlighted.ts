import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../../model';
import type { SerialisedActor } from '../../screenplay';
import { Timestamp } from '../../screenplay';
import { DomainEvent } from '../DomainEvent';

/**
 * Emitted when an [`Actor`](https://serenity-js.org/api/core/class/Actor/) becomes
 * the active actor (moves into the spotlight) as the result of invoking
 * [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/).
 *
 * This event is emitted only when the spotlight shifts to a different actor.
 * Consecutive retrievals of the same actor do not emit additional events.
 *
 * To detect when an actor is instantiated for the first time, listen for
 * [`ActorEntersStage`](https://serenity-js.org/api/core-events/class/ActorEntersStage/).
 *
 * @group Events
 */
export class ActorSpotlighted extends DomainEvent {
    public static fromJSON(o: JSONObject): ActorSpotlighted {
        return new ActorSpotlighted(
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
