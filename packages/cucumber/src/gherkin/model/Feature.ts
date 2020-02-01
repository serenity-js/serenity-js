import { FileSystemLocation } from '@serenity-js/core/lib/io';
import { Description, Name } from '@serenity-js/core/lib/model';

import { Background } from './Background';
import { FeatureFileNode } from './FeatureFileNode';

/**
 * @private
 */
export class Feature extends FeatureFileNode {
    constructor(
        location: FileSystemLocation,
        name: Name,
        public readonly description: Description,
        public readonly background?: Background,
    ) {
        super(location, name);
    }
}
