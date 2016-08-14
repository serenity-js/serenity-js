export function listOf (commaSeparatedValues: string): string[] {
    return commaSeparatedValues.split(',').map(i => i.trim());
};
