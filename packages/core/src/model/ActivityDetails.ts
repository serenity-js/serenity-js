import { JSONObject, TinyType } from 'tiny-types';

import { Name } from './Name';

export class ActivityDetails extends TinyType {
    static fromJSON(o: JSONObject): ActivityDetails {
        return new ActivityDetails(
            Name.fromJSON(o.name as string),
        );
    }

    constructor(
        public readonly name: Name,
    ) {
        super();
    }

    toJSON(): { name: string } {
        return {
            name: this.name.value,
        }
    }
}
