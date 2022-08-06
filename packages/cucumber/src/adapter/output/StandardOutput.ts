import { OutputDescriptor } from './OutputDescriptor';
import { SerenityFormatterOutput } from './SerenityFormatterOutput';
import { StandardOutputDescriptor } from './StandardOutputDescriptor';

/**
 * @package
 */
export class StandardOutput implements SerenityFormatterOutput {
    get(): OutputDescriptor {
        return new StandardOutputDescriptor();
    }
}
