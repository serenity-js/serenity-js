import type { FileSystemLocation } from '@serenity-js/core/io';
import type { Description, Name, ScenarioParameters } from '@serenity-js/core/model';

import { FeatureFileNode } from './FeatureFileNode.js';
import type { Step } from './Step.js';

/**
 * @private
 */
export class ScenarioOutline extends FeatureFileNode {
    constructor(
        location: FileSystemLocation,
        name: Name,
        public readonly description: Description,
        public readonly steps: Step[],
        public readonly parameters: { [line: number]: ScenarioParameters },
    ) {
        super(location, name);
    }
}
