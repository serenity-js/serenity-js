/**
 * Strips absolute path prefixes from error messages and stack traces, rendering
 * paths relative to the specDirectory.
 *
 * Uses a marker approach: finds occurrences of `/specDirectory/` in the text
 * and strips everything before the marker, so absolute paths become relative.
 *
 * Example:
 *   text: "at /home/runner/work/project/spec/login.spec.ts:42"
 *   specDirectory: "spec" (or "./spec")
 *   result: "at spec/login.spec.ts:42"
 */
export function stripAbsolutePaths(text: string, specDirectory?: string): string {
    if (!specDirectory || !text) return text;

    // Normalise: strip leading ./ and trailing /
    const normalised = specDirectory.replace(/^\.\//, '').replace(/\/$/, '');
    if (!normalised) return text;

    const marker = '/' + normalised + '/';
    return text.replaceAll(new RegExp(`/[^\\s:]*${escapeRegex(marker)}`, 'g'), normalised + '/');
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
