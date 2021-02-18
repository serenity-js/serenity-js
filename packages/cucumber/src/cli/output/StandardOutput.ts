import { CucumberFormatterOutput } from './CucumberFormatterOutput';
import { StandardOutputDescriptor } from './StandardOutputDescriptor';
import { OutputDescriptor } from './OutputDescriptor';

/**
 * @package
 */
export class StandardOutput implements CucumberFormatterOutput {
    get(): OutputDescriptor {
        return new StandardOutputDescriptor();
    }
}
