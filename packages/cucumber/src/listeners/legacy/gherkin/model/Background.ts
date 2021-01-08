import { FileSystemLocation } from '@serenity-js/core/lib/io';
import { Description, Name } from '@serenity-js/core/lib/model';

import { FeatureFileNode } from './FeatureFileNode';
import { Step } from './Step';

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
