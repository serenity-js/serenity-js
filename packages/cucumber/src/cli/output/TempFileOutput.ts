import { CucumberFormatterOutput } from './CucumberFormatterOutput';
import { OutputDescriptor } from './OutputDescriptor';
import { FileSystem } from '@serenity-js/core/lib/io';
import { TempFileOutputDescriptor } from './TempFileOutputDescriptor';

/**
 * @package
 */
export class TempFileOutput implements CucumberFormatterOutput {
    constructor(private readonly fs: FileSystem) {
    }

    get(): OutputDescriptor {
        return new TempFileOutputDescriptor(this.fs);
    }
}
