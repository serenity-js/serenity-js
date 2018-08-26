import { Description, Name } from '@serenity-js/core/lib/model';
import { TinyType } from 'tiny-types';

import { Background } from './Background';

export class Feature extends TinyType {
    constructor(
        public readonly name: Name,
        public readonly description: Description,
        public readonly background: Background,
    ) {
        super();
    }
}
