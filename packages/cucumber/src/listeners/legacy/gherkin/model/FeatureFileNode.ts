import type { FileSystemLocation } from '@serenity-js/core/lib/io/index.js';
import type { Name } from '@serenity-js/core/lib/model/index.js';
import { TinyType } from 'tiny-types';

/**
 * @private
 */
export abstract class FeatureFileNode extends TinyType {
    constructor(
        public readonly location: FileSystemLocation,
        public readonly name: Name,
    ) {
        super();
    }
}
