import { SpecFilter } from './SpecFilter.js';

/**
 * @package
 */
export class CustomFunctionSpecFilter implements SpecFilter {
    constructor(private readonly fn: (specName: string) => boolean) {
    }

    matches(specName: string): boolean {
        return this.fn(specName);
    }
}
