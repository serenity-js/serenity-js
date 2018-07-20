import { TinyType } from 'tiny-types';

import { Name } from './Name';

// todo: if ActivityDetails only contains the name, I might as well just get rid of it ...
export class ActivityDetails extends TinyType {
    constructor(public readonly name: Name) {
        super();
    }
}
