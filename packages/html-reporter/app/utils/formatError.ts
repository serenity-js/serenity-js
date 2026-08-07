/**
 * Strips absolute paths from error messages using regex pattern matching.
 * Preserves the relative portion after the spec directory.
 * 
 * Used for cleaning up stack traces and error messages for display.
 * 
 * @param text - Error message or stack trace
 * @param specDirectory - Spec directory name
 * @returns Text with absolute paths stripped
 * 
 * @example
 * stripAbsolutePaths('Error at /project/spec/auth.spec.ts:42', 'spec')
 * // → 'Error at spec/auth.spec.ts:42'
 */
export function stripAbsolutePaths(text: string, specDirectory?: string): string {
    if (!specDirectory || !text) return text;

    // Normalise: strip leading ./ and trailing /
    const normalised = specDirectory.replace(/^\.\//, '').replace(/\/$/, '');
    if (!normalised) return text;

    const marker = '/' + normalised + '/';
    return text.replace(new RegExp(`/[^\\s:]*${escapeRegex(marker)}`, 'g'), normalised + '/');
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
