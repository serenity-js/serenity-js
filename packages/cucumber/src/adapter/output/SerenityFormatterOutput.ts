import type { OutputDescriptor } from './OutputDescriptor.js';

/**
 * @group Integration
 */
export interface SerenityFormatterOutput {
    get(): OutputDescriptor;
}
