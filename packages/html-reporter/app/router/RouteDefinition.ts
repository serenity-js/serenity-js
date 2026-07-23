import type { ComponentChild } from 'preact';

import type { ReportData } from '../../src/cli/ReportData';

export interface RouteParameters {
    /** Full path portion of the hash route (before '?') */
    path: string;
    /** Parsed query parameters from the hash route */
    query: URLSearchParams;
    /** Captured dynamic segment (e.g. the scenario ID from /tests/:id) */
    segment?: string;
}

/**
 * A route definition that ties a view component to its data source.
 *
 * The generic `P` ensures type safety between `data` (which produces props)
 * and `view` (which consumes them). App.ts additionally passes `onNavigate`
 * at render time.
 */
export interface RouteConfig<P> {
    pattern: string;
    title: string | ((data: ReportData) => string);
    view: (props: P & { onNavigate: (path: string) => void }) => ComponentChild;
    data: (data: ReportData, params: RouteParameters) => P;
    icon?: string;
    navLabel?: string;
    badge?: (data: ReportData) => number;
}

/**
 * Type-erased route definition used in the routes array.
 * Individual routes are type-checked at definition time via {@link defineRoute}.
 */
export interface RouteDefinition {
    pattern: string;
    title: string | ((data: ReportData) => string);
    view: (props: Record<string, unknown>) => ComponentChild;
    data: (data: ReportData, params: RouteParameters) => Record<string, unknown>;
    icon?: string;
    navLabel?: string;
    badge?: (data: ReportData) => number;
}

/**
 * Defines a route with compile-time verification that the view's props
 * match the data function's return type.
 */
export function defineRoute<P>(config: RouteConfig<P>): RouteDefinition {
    return config as unknown as RouteDefinition;
}

/**
 * Reconstructs the full route string including query parameters.
 */
export function routeWithQuery(params: RouteParameters): string {
    const qs = params.query.toString();
    return qs ? params.path + '?' + qs : params.path;
}
