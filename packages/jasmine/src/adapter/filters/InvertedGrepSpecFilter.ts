import { SpecFilter } from './SpecFilter';

/**
 * @package
 */
export class InvertedGrepSpecFilter implements SpecFilter {
    private readonly pattern: RegExp;

    constructor(pattern: RegExp | string) {
        this.pattern = new RegExp(pattern)
    }

    matches(specName: string): boolean {
        return ! this.pattern.test(specName);
    }
}
