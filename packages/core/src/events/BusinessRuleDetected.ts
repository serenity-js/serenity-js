import { ensure, isDefined, JSONObject } from 'tiny-types';

import { BusinessRule, CorrelationId, ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @desc
 *  Emitted by [@serenity-js/cucumber](https://serenity-js.org/modules/cucumber)
 *  when a [business rule](https://cucumber.io/docs/gherkin/reference/#rule) is detected.
 *
 * @extends {DomainEvent}
 */
export class BusinessRuleDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): BusinessRuleDetected {
        return new BusinessRuleDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            ScenarioDetails.fromJSON(o.details as JSONObject),
            BusinessRule.fromJSON(o.rule as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly details: ScenarioDetails,
        public readonly rule: BusinessRule,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('details', details, isDefined());
        ensure('rule', rule, isDefined());
    }
}
