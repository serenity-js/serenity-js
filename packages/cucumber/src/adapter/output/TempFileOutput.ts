/* eslint-disable unicorn/prevent-abbreviations */
import type { FileSystem } from '@serenity-js/core/io';

import type { OutputDescriptor } from './OutputDescriptor.js';
import type { SerenityFormatterOutput } from './SerenityFormatterOutput.js';
import { TempFileOutputDescriptor } from './TempFileOutputDescriptor.js';

/**
 * @group Integration
 */
export class TempFileOutput implements SerenityFormatterOutput {
    constructor(private readonly fs: FileSystem) {
    }

    get(): OutputDescriptor {
        return new TempFileOutputDescriptor(this.fs);
    }
}
