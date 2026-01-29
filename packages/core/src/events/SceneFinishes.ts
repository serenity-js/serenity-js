import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import type { SerialisedOutcome } from '../model';
import { CorrelationId, ExecutionSuccessful, Outcome } from '../model';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

/**
 * Emitted by a Serenity/JS test runner adapter, right before a test and all its associated test hooks finish.
 * Triggers any clean-up operations that might be required, such as discarding of
 * the [discardable](https://serenity-js.org/api/core/interface/Discardable/) abilities.
 *
 * The `outcome` property contains the test outcome determined so far, before any cleanup operations.
 * This allows stage crew members like the WebdriverIO notifier to invoke hooks with the test result
 * before `waitForNextCue()` is called.
 *
 * @group Events
 */
export class SceneFinishes extends DomainEvent {
    static fromJSON(o: JSONObject): SceneFinishes {
        return new SceneFinishes(
            CorrelationId.fromJSON(o.sceneId as string),
            o.outcome
                ? Outcome.fromJSON(o.outcome as SerialisedOutcome)
                : new ExecutionSuccessful(),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly outcome: Outcome = new ExecutionSuccessful(),
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
