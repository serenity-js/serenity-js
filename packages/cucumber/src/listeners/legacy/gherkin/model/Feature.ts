import type { FileSystemLocation } from '@serenity-js/core/io';
import type { Description, Name } from '@serenity-js/core/model';

import type { Background } from './Background.js';
import { FeatureFileNode } from './FeatureFileNode.js';

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
