import { OutputDescriptor } from './OutputDescriptor';

/**
 * @package
 */
export interface SerenityFormatterOutput {
    get(): OutputDescriptor;
}
