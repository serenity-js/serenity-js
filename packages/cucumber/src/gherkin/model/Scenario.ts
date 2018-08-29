import { FileSystemLocation } from '@serenity-js/core/lib/io';
import { Description, Name, Tag } from '@serenity-js/core/lib/model';

import { FeatureFileNode } from './FeatureFileNode';
import { Step } from './Step';

export class Scenario extends FeatureFileNode {
    constructor(
        location: FileSystemLocation,
        name: Name,
        public readonly description: Description,
        public readonly steps: Step[],
        public readonly tags: Tag[] = [],
        public readonly outline?: FileSystemLocation,
    ) {
        super(location, name);
    }
}
