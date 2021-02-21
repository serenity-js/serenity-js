import { SerenityFormatterOutput } from './SerenityFormatterOutput';
import { StandardOutputDescriptor } from './StandardOutputDescriptor';
import { OutputDescriptor } from './OutputDescriptor';

/**
 * @package
 */
export class StandardOutput implements SerenityFormatterOutput {
    get(): OutputDescriptor {
        return new StandardOutputDescriptor();
    }
}
