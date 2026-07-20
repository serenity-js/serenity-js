/**
 * Strips the specDirectory prefix from absolute file paths in error messages and stack traces.
 * Renders relative paths in the UI while keeping absolute paths available for copy-to-clipboard.
 */
export function stripAbsolutePaths(text: string, specDirectory?: string): string {
    if (!specDirectory || !text) return text;
    const prefix = specDirectory.endsWith('/') ? specDirectory : specDirectory + '/';
    return text.replaceAll(prefix, '');
}
