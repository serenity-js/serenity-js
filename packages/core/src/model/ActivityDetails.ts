import { JSONObject, TinyType } from 'tiny-types';

import { CorrelationId } from './CorrelationId';
import { Name } from './Name';

export class ActivityDetails extends TinyType {
    static fromJSON(o: JSONObject) {
        return new ActivityDetails(
            Name.fromJSON(o.name as string),
            CorrelationId.fromJSON(o.correlationId as string),
        );
    }

    // todo: might need to add a correlation id
    constructor(
        public readonly name: Name,
        public readonly correlationId: CorrelationId = CorrelationId.create(),
    ) {
        super();
    }
}
