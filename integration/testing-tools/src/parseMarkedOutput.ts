/**
 * Parses lines from stdout that contain a specific marker prefix and extracts JSON data.
 *
 * @param stdout - The stdout string to parse
 * @param marker - The marker prefix to look for (e.g., '[AfterTest]')
 * @returns An array of parsed JSON objects from lines containing the marker
 *
 * @example
 * ```typescript
 * // Given stdout containing: [MyMarker]{"key":"value"}
 * const results = parseMarkedOutput(stdout, '[MyMarker]');
 * // results = [{ key: 'value' }]
 * ```
 */
export function parseMarkedOutput<T = Record<string, unknown>>(stdout: string, marker: string): T[] {
    const escapedMarker = marker.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
    const pattern = new RegExp(`${ escapedMarker }(.*)$`);

    return stdout.split('\n')
        .filter(line => line.includes(marker))
        .map(line => {
            const matched = line.match(pattern);
            if (matched && matched[1]) {
                try {
                    return JSON.parse(matched[1]) as T;
                }
                catch {
                    return void 0;
                }
            }
            return void 0;
        })
        .filter((item): item is T => item !== undefined);
}
