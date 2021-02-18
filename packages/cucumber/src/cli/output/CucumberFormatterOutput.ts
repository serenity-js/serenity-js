import { OutputDescriptor } from './OutputDescriptor';

/**
 * @package
 */
export interface CucumberFormatterOutput {
    get(): OutputDescriptor;
}
