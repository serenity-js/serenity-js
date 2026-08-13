/**
 * Formats a source location by stripping a spec directory prefix and appending the line number.
 * Uses a prefix-based approach (expects spec directory at the start of the path).
 * 
 * Used during data serialization and aggregation.
 * 
 * @param source - Source with path and optional line number
 * @param specDirectory - Spec directory name
 * @returns Formatted path (e.g., "auth.spec.ts:42")
 * 
 * @package
 */
export function formatSource(source: { path: string; line?: number }, specDirectory?: string): string {
    let path = source.path;

    if (specDirectory) {
        const prefix = specDirectory.endsWith('/') ? specDirectory : specDirectory + '/';
        if (path.startsWith(prefix)) {
            path = path.slice(prefix.length);
        }
    }

    if (source.line !== undefined) {
        return `${ path }:${ source.line }`;
    }

    return path;
}
