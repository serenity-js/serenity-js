import { ensure, isDefined } from 'tiny-types';

import { ScenarioDetails, Tag, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneTagged extends DomainEvent {
    constructor(
        public readonly value: ScenarioDetails,
        public readonly tag: Tag,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
