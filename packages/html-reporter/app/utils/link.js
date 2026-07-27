/**
 * Type-safe URL builder for internal navigation in the HTML report.
 *
 * Uses discriminated union types to ensure only valid parameters are accepted for each view.
 * Automatically handles URL encoding of all path segments and query parameters.
 *
 * @module
 */
/**
 * Builds internal navigation URLs for the HTML report.
 * Automatically handles URL encoding and query parameter construction.
 *
 * Uses discriminated union types to ensure only valid parameters are accepted for each view.
 *
 * @example
 * // Navigate to test scenarios view
 * link({ view: 'tests' })
 * // → '/tests'
 *
 * @example
 * // Filter scenarios by search
 * link({ view: 'tests', search: '@module:playwright-test' })
 * // → '/tests?search=%40module%3Aplaywright-test'
 *
 * @example
 * // View scenario detail
 * link({ view: 'tests', path: 'auth.spec.ts:42', run: '8333', browser: 'chromium' })
 * // → '/tests/auth.spec.ts%3A42?run=8333&browser=chromium'
 *
 * @example
 * // Navigate to capabilities with path
 * link({ view: 'capabilities', path: 'authentication/login' })
 * // → '/capabilities?path=authentication%2Flogin'
 *
 * @param options - Link configuration with view type and parameters
 * @returns URL path with properly encoded path segments and query parameters
 */
export function link(options) {
    const { view } = options;
    // Build base path
    let base = view === 'dashboard' ? '/' : '/' + view;
    // Handle path segment for detail views (with proper type narrowing)
    if (options.view === 'tests' && options.path) {
        base += '/' + encodeURIComponent(options.path);
    }
    // Build query parameters using URLSearchParams for automatic encoding
    const params = new URLSearchParams();
    // Tests view parameters
    if (options.view === 'tests') {
        if (options.run !== undefined && options.run !== null) {
            params.set('run', String(options.run));
        }
        if (options.search) {
            params.set('search', options.search);
        }
        if (options.filter && options.filter !== 'all') {
            params.set('filter', options.filter);
        }
        if (options.sort) {
            params.set('sort', options.sort);
        }
        if (options.browser) {
            params.set('browser', options.browser);
        }
        if (options.project) {
            params.set('project', options.project);
        }
        if (options.platform) {
            params.set('platform', options.platform);
        }
    }
    // Capabilities view parameters (path as query param, not path segment)
    if (options.view === 'capabilities' && options.path) {
        params.set('path', options.path);
    }
    // Errors view parameters
    if (options.view === 'errors') {
        if (options.run !== undefined && options.run !== null) {
            params.set('run', String(options.run));
        }
        if (options.search) {
            params.set('search', options.search);
        }
    }
    // URLSearchParams.toString() encodes spaces as '+', but we want '%20' for consistency
    // with encodeURIComponent (used for path segments) and existing moduleUrls patterns
    const query = params.toString().replace(/\+/g, '%20');
    return query ? base + '?' + query : base;
}
/**
 * Convenience function for building test scenario list URLs.
 * More concise than writing `link({ view: 'tests', ... })`.
 *
 * @example
 * testsLink()
 * // → '/tests'
 *
 * @example
 * testsLink({ run: '42', filter: 'failed' })
 * // → '/tests?run=42&filter=failed'
 *
 * @param options - Optional TestsLink parameters (omit the 'view' field)
 * @returns URL path for tests view
 */
export function testsLink(options = {}) {
    return link({ view: 'tests', ...options });
}
/**
 * Convenience function for building scenario detail URLs.
 * Handles the common pattern of building IDs from source location.
 *
 * @example
 * scenarioLink({ path: 'auth.spec.ts', line: 42 })
 * // → '/tests/auth.spec.ts%3A42'
 *
 * @example
 * scenarioLink({ path: 'auth.spec.ts', line: 42 }, { run: '8333', browser: 'chromium' })
 * // → '/tests/auth.spec.ts%3A42?run=8333&browser=chromium'
 *
 * @param source - Source location with path and optional line number or name
 * @param options - Optional additional TestsLink parameters
 * @returns URL path for scenario detail
 */
export function scenarioLink(source, options = {}) {
    const id = source.line !== undefined
        ? source.path + ':' + source.line
        : source.name
            ? source.path + ':' + source.name
            : source.path;
    return link({ view: 'tests', path: id, ...options });
}
/**
 * Convenience function for building capability detail URLs.
 *
 * @example
 * capabilityLink('authentication/login')
 * // → '/capabilities?path=authentication%2Flogin'
 *
 * @param path - Capability tree path
 * @returns URL path for capability detail
 */
export function capabilityLink(path) {
    return link({ view: 'capabilities', path });
}
//# sourceMappingURL=link.js.map