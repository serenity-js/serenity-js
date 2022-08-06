/* eslint-disable unicorn/prevent-abbreviations */
import { FileSystem } from '@serenity-js/core/lib/io';

import { OutputDescriptor } from './OutputDescriptor';
import { SerenityFormatterOutput } from './SerenityFormatterOutput';
import { TempFileOutputDescriptor } from './TempFileOutputDescriptor';

/**
 * @package
 */
export class TempFileOutput implements SerenityFormatterOutput {    // eslint-disable-line unicorn/prevent-abbreviations
    constructor(private readonly fs: FileSystem) {
    }

    get(): OutputDescriptor {
        return new TempFileOutputDescriptor(this.fs);
    }
}
