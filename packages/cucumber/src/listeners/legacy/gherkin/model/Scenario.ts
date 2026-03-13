import type { FileSystemLocation } from '@serenity-js/core/lib/io/index.js';
import type { Description, Name, Tag } from '@serenity-js/core/lib/model/index.js';

import { FeatureFileNode } from './FeatureFileNode.js';
import type { Hook } from './Hook.js';
import type { Step } from './Step.js';

/**
 * @private
 */
export class Scenario extends FeatureFileNode {
    constructor(
        location: FileSystemLocation,
        name: Name,
        public readonly description: Description,
        public readonly steps: Array<Step | Hook>,
        public readonly tags: Tag[] = [],
        public readonly outline?: FileSystemLocation,
    ) {
        super(location, name);
    }
}
