import { JSONObject, TinyType } from 'tiny-types';

import { CorrelationId } from './CorrelationId';
import { Name } from './Name';

export class ActivityDetails extends TinyType {
    static fromJSON(o: JSONObject) {
        return new ActivityDetails(
            Name.fromJSON(o.name as string),
        );
    }

    constructor(
        public readonly name: Name,
    ) {
        super();
    }

    toJSON() {
        return {
            name: this.name.value,
        }
    }
}
