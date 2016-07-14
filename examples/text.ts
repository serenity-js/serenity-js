
export function listOf (comma_separated_values: string): string[] {
    return comma_separated_values.split(',').map(i => i.trim());
}
