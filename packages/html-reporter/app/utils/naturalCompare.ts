/**
 * Compares two strings using natural (numeric-aware) ordering.
 * "item 2" < "item 10", "cucumber 9" < "cucumber 10".
 */
export function naturalCompare(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
