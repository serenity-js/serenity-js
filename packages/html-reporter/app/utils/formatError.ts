/**
 * Strips absolute path prefixes from error messages and stack traces, rendering
 * paths relative to the specDirectory.
 *
 * Uses the same marker approach as `relativeSourcePath()`: finds occurrences of
 * `/specDirectory/` in the text and strips everything before the marker.
 *
 * Example:
 *   text: "at /home/runner/work/project/spec/login.spec.ts:42"
 *   specDirectory: "spec"
 *   result: "at spec/login.spec.ts:42"
 */
export function stripAbsolutePaths(text: string, specDirectory?: string): string {
    if (!specDirectory || !text) return text;
    const marker = '/' + specDirectory + '/';
    return text.replaceAll(new RegExp(`/[^\\s:]*${escapeRegex(marker)}`, 'g'), specDirectory + '/');
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
