import type { FileSystemLocation } from '@serenity-js/core/io';
import type { Name } from '@serenity-js/core/model';
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
