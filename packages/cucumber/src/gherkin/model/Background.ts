import { Description, Name } from '@serenity-js/core/lib/model';
import { TinyType } from 'tiny-types';

import { Step } from './Step';

export class Background extends TinyType {
    constructor(
        public readonly name: Name,
        public readonly description: Description,
        public readonly steps: Step[],
    ) {
        super();
    }
}
