import { ensure, isDefined } from 'tiny-types';

import { ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ExecutionContextPropertyDetected<T extends object> extends DomainEvent {
    constructor(
        public readonly scenarioDetails: ScenarioDetails,
        public readonly value: T,
        public readonly timestamp: Timestamp = new Timestamp(),
    ) {
        super();
        ensure('scenarioDetails', scenarioDetails, isDefined());
        ensure('timestamp', timestamp, isDefined());
    }
}
