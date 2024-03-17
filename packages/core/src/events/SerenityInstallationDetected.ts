import type { JSONObject } from 'tiny-types';

import { SerenityInstallationDetails } from '../io';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

export class SerenityInstallationDetected extends DomainEvent {
    static fromJSON(v: JSONObject): SerenityInstallationDetected {
        return new SerenityInstallationDetected(
            SerenityInstallationDetails.fromJSON(v.details as JSONObject),
            Timestamp.fromJSON(v.timestamp as string),
        );
    }

    constructor(
        public readonly details: SerenityInstallationDetails,
        timestamp?: Timestamp
    ) {
        super(timestamp);
    }
}
