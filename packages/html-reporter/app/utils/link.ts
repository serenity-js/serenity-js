/**
 * Type-safe URL builder for internal navigation in the HTML report.
 * 
 * Uses discriminated union types to ensure only valid parameters are accepted for each view.
 * Automatically handles URL encoding of all path segments and query parameters.
 * 
 * @module
 */

/**
 * Discriminated union of all possible link options.
 * Each view type has its own interface with only the parameters it accepts.
 */
export type LinkOptions =
    | DashboardLink
    | TestsLink
    | CapabilitiesLink
    | ErrorsLink
    | ConsistencyLink
    | TimelineLink
    | TagsLink
    | TestRunsLink
    | SystemLink
    | AboutLink;

/**
 * Dashboard view — no parameters (static view).
 */
export interface DashboardLink {
    view: 'dashboard';
}

/**
 * Test Scenarios view — supports filtering, searching, sorting, run selection.
 * 
 * Path parameter (when present) creates a detail URL: `/tests/{path}?...`
 * All other parameters become query parameters.
 */
export interface TestsLink {
    view: 'tests';
    /** Scenario identifier for detail view (e.g., 'file.spec.ts:42' or 'file.spec.ts:scenarioName') */
    path?: string;
    /** Test run ID or timestamp */
    run?: string | number;
    /** Search query (e.g., '@module:playwright-test', '@browser:chromium') */
    search?: string;
    /** Outcome filter */
    filter?: OutcomeFilter;
    /** Sort order */
    sort?: 'category' | 'name' | 'duration' | 'status';
    /** Browser tag (for multi-variant scenario discrimination) */
    browser?: string;
    /** Project tag (for multi-variant scenario discrimination) */
    project?: string;
    /** Platform tag (for multi-variant scenario discrimination) */
    platform?: string;
}

/**
 * Capabilities view — path-based navigation via query parameter.
 */
export interface CapabilitiesLink {
    view: 'capabilities';
    /** Capability tree path (e.g., 'authentication/login') */
    path?: string;
}

/**
 * Errors view — supports filtering and run selection.
 */
export interface ErrorsLink {
    view: 'errors';
    /** Test run ID or timestamp */
    run?: string | number;
    /** Search query */
    search?: string;
}

/**
 * Consistency view — no parameters (shows inconsistent tests).
 */
export interface ConsistencyLink {
    view: 'consistency';
}

/**
 * Timeline view — no parameters (chronological view).
 */
export interface TimelineLink {
    view: 'timeline';
}

/**
 * Tags view — no parameters (tag overview).
 */
export interface TagsLink {
    view: 'tags';
}

/**
 * Test Runs view — no parameters (run history).
 */
export interface TestRunsLink {
    view: 'test-runs';
}

/**
 * System Context view — no parameters (environment info).
 */
export interface SystemLink {
    view: 'system';
}

/**
 * About view — no parameters (report metadata).
 */
export interface AboutLink {
    view: 'about';
}

/**
 * Valid outcome filter values.
 */
export type OutcomeFilter = 'all' | 'passed' | 'failed' | 'skipped' | 'pending' | 'compromised' | 'error';

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
export function link(options: LinkOptions): string {
    const base = buildBasePath(options);
    const params = buildQueryParams(options);

    // URLSearchParams.toString() encodes spaces as '+', but we want '%20' for consistency
    // with encodeURIComponent (used for path segments) and existing moduleUrls patterns
    const query = params.toString().replace(/\+/g, '%20');
    return query ? base + '?' + query : base;
}

function buildBasePath(options: LinkOptions): string {
    const base = options.view === 'dashboard' ? '/' : '/' + options.view;

    // Tests view supports path segment for scenario detail
    if (options.view === 'tests' && options.path) {
        return base + '/' + encodeURIComponent(options.path);
    }

    return base;
}

type Transform = (value: unknown) => string | undefined;

/** Pass through as string */
const passThrough: Transform = (value) => String(value);

/** Skip 'all' filter since it's the default */
const skipIfAll: Transform = (value) => value === 'all' ? undefined : String(value);

/**
 * View-specific parameter mappings: { paramName: transform }
 * Note: 'path' for tests view is handled as a path segment in buildBasePath(), not here.
 */
const viewParams: Record<string, Record<string, Transform>> = {
    tests: {
        run: passThrough,
        search: passThrough,
        filter: skipIfAll,
        sort: passThrough,
        browser: passThrough,
        project: passThrough,
        platform: passThrough,
    },
    capabilities: {
        path: passThrough,
    },
    errors: {
        run: passThrough,
        search: passThrough,
    },
};

function buildQueryParams(options: LinkOptions): URLSearchParams {
    const params = new URLSearchParams();
    const mappings = viewParams[options.view] || {};

    for (const [param, transform] of Object.entries(mappings)) {
        const value = (options as Record<string, unknown>)[param];

        if (value === undefined || value === null) {
            continue;
        }

        const transformed = transform(value);
        if (transformed !== undefined) {
            params.set(param, transformed);
        }
    }

    return params;
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
export function testsLink(options: Omit<TestsLink, 'view'> = {}): string {
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
export function scenarioLink(
    source: { path: string; line?: number; name?: string },
    options: Omit<TestsLink, 'view' | 'path'> = {},
): string {
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
export function capabilityLink(path: string): string {
    return link({ view: 'capabilities', path });
}
