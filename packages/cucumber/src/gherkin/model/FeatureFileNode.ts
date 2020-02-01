import { FileSystemLocation } from '@serenity-js/core/lib/io';
import { Name } from '@serenity-js/core/lib/model';
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
