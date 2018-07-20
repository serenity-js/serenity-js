import { ensure, isDefined } from 'tiny-types';

import { Outcome, ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneFinished extends DomainEvent {
    constructor(
        public readonly value: ScenarioDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
