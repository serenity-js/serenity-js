/**
 * Type-safe URL builder for internal navigation in the HTML report.
 * 
 * Re-exported from app/utils/link.ts to make types available during TypeScript compilation.
 * The actual implementations in the Node.js runtime may differ from the browser implementations.
 * 
 * @module
 */

/**
 * Valid outcome filter values.
 */
export type OutcomeFilter = 'all' | 'passed' | 'failed' | 'skipped' | 'pending' | 'compromised' | 'error';

/**
 * Test Scenarios view link options.
 */
export interface TestsLink {
    view: 'tests';
    /** Scenario identifier for detail view */
    path?: string;
    /** Test run ID or timestamp */
    run?: string | number;
    /** Search query */
    search?: string;
    /** Outcome filter */
    filter?: OutcomeFilter;
    /** Sort order */
    sort?: 'category' | 'name' | 'duration' | 'status';
    /** Browser tag */
    browser?: string;
    /** Project tag */
    project?: string;
    /** Platform tag */
    platform?: string;
}

/**
 * Capabilities view link options.
 */
export interface CapabilitiesLink {
    view: 'capabilities';
    /** Capability tree path */
    path?: string;
}

/**
 * Discriminated union of all possible link options.
 */
export type LinkOptions =
    | { view: 'dashboard' }
    | TestsLink
    | CapabilitiesLink
    | { view: 'errors'; run?: string | number; search?: string }
    | { view: 'consistency' }
    | { view: 'timeline' }
    | { view: 'tags' }
    | { view: 'test-runs' }
    | { view: 'system' }
    | { view: 'about' };

/**
 * Builds internal navigation URLs for the HTML report.
 * 
 * This is a runtime stub for interaction objects. The actual implementation lives in app/utils/link.ts
 * and is bundled into the browser report. This stub is used during TypeScript compilation and testing.
 * 
 * @param options - Link configuration
 * @returns URL path
 */
export function link(options: LinkOptions): string {
    const { view } = options;
    let base = view === 'dashboard' ? '/' : '/' + view;

    if (options.view === 'tests' && options.path) {
        base += '/' + encodeURIComponent(options.path);
    }

    const params = new URLSearchParams();

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

    if (options.view === 'capabilities' && options.path) {
        params.set('path', options.path);
    }

    if (options.view === 'errors') {
        if (options.run !== undefined && options.run !== null) {
            params.set('run', String(options.run));
        }
        if (options.search) {
            params.set('search', options.search);
        }
    }

    const query = params.toString().replace(/\+/g, '%20');
    return query ? base + '?' + query : base;
}
