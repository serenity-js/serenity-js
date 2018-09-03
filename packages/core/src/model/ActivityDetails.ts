import { Serialised, TinyType } from 'tiny-types';

import { Name } from './Name';

export class ActivityDetails extends TinyType {
    static fromJSON(v: string) {
        return new ActivityDetails(
            Name.fromJSON(v),
        );
    }

    // todo: might need to add a correlation id
    constructor(public readonly name: Name) {
        super();
    }
}
