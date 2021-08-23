import { SpecFilter } from './SpecFilter';

/**
 * @desc
 *  https://github.com/jasmine/jasmine-npm/blob/641c33d4765efb0486f68980a8b7d184dd797122/lib/filters/console_spec_filter.js
 *
 * @package
 */
export class GrepSpecFilter implements SpecFilter {
    private readonly pattern: RegExp;

    constructor(pattern: RegExp | string) {
        this.pattern = new RegExp(pattern)
    }

    matches(specName: string): boolean {
        return this.pattern.test(specName);
    }
}
