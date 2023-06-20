import { SpecFilter } from './SpecFilter.js';

/**
 * @package
 */
export class AcceptingSpecFilter implements SpecFilter {
    matches(specName: string): boolean {
        return true;
    }
}
