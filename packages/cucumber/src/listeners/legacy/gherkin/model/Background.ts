import type { FileSystemLocation } from '@serenity-js/core/io';
import type { Description, Name } from '@serenity-js/core/model';

import { FeatureFileNode } from './FeatureFileNode.js';
import type { Step } from './Step.js';

/**
 * @private
 */
export class Background extends FeatureFileNode {
    constructor(
        location: FileSystemLocation,
        name: Name,
        public readonly description: Description,
        public readonly steps: Step[],
    ) {
        super(location, name);
    }
}
