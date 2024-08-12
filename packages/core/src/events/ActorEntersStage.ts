import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../model';
import type { Actor} from '../screenplay';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

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
            o.actor as ReturnType<Actor['toJSON']>,
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly actor: ReturnType<Actor['toJSON']>,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('actor', actor, isDefined());
    }
}
