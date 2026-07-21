import type { ReportData } from '../../src/cli/ReportData';

export interface RouteParameters {
    /** Full path portion of the hash route (before '?') */
    path: string;
    /** Parsed query parameters from the hash route */
    query: URLSearchParams;
    /** Captured dynamic segment (e.g. the scenario ID from /tests/:id) */
    segment?: string;
}

export interface RouteDefinition {
    /**
     * URL pattern to match.
     * - Exact: '/tags'
     * - With query: '/tests' (also matches '/tests?filter=failed')
     * - Dynamic segment: '/tests/:id' (captures everything after '/tests/')
     */
    pattern: string;

    /** Page title. String or function for dynamic titles. */
    title: string | ((data: ReportData) => string);

    /** The view component to render for this route. */
    view: (props: Record<string, unknown>) => unknown;

    /** Icon key from icons.ts for the sidebar navigation. */
    icon?: string;

    /** Label for the sidebar navigation. Omit to hide from nav. */
    navLabel?: string;

    /** Badge count for the sidebar navigation item. */
    badge?: (data: ReportData) => number;

    /**
     * Selects the data subset this view needs from the full ReportData.
     * Returns the props object that will be spread onto the view component.
     */
    data: (data: ReportData, params: RouteParameters) => Record<string, unknown>;
}
