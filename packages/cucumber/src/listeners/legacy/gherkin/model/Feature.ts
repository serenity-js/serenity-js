import type { FileSystemLocation } from '@serenity-js/core/lib/io/index.js';
import type { Description, Name } from '@serenity-js/core/lib/model/index.js';

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
