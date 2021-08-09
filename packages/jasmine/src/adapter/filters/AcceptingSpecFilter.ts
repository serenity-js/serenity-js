import { SpecFilter } from './SpecFilter';

/**
 * @package
 */
export class AcceptingSpecFilter implements SpecFilter {
    matches(specName: string): boolean {
        return true;
    }
}
