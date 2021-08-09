/**
 * @package
 */
export interface SpecFilter {
    matches(specName: string): boolean;
}
