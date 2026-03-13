import type { OutputDescriptor } from './OutputDescriptor.js';
import type { SerenityFormatterOutput } from './SerenityFormatterOutput.js';
import { StandardOutputDescriptor } from './StandardOutputDescriptor.js';

/**
 * @group Integration
 */
export class StandardOutput implements SerenityFormatterOutput {
    get(): OutputDescriptor {
        return new StandardOutputDescriptor();
    }
}
