/**
 * Formats a source location by stripping a specDirectory prefix and appending the line number.
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
