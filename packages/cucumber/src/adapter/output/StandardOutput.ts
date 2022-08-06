import { OutputDescriptor } from './OutputDescriptor';
import { SerenityFormatterOutput } from './SerenityFormatterOutput';
import { StandardOutputDescriptor } from './StandardOutputDescriptor';

/**
 * @group Integration
 */
export class StandardOutput implements SerenityFormatterOutput {
    get(): OutputDescriptor {
        return new StandardOutputDescriptor();
    }
}
