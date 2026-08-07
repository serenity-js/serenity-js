import type { RouteDefinition, RouteParameters } from './RouteDefinition.js';

export interface RouteMatch {
    definition: RouteDefinition;
    params: RouteParameters;
}

/**
 * Matches a hash route string against the route table.
 * Returns the first matching route definition and its extracted parameters.
 *
 * Matching rules:
 * - Exact match: '/tags' matches only '/tags'
 * - Query match: '/tests' matches '/tests' and '/tests?filter=failed'
 * - Dynamic segment: '/tests/:id' matches '/tests/anything-here' and captures the segment
 *
 * The route table is evaluated in order — put more specific patterns before general ones.
 */
export function resolveRoute(route: string, routes: RouteDefinition[]): RouteMatch | undefined {
    const path = route.includes('?') ? route.split('?')[0] : route;
    const query = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : new URLSearchParams();

    for (const definition of routes) {
        const pattern = definition.pattern;

        if (pattern.includes(':')) {
            // Dynamic segment pattern: '/tests/:id'
            const prefix = pattern.split(':')[0]; // '/tests/'
            if (path.startsWith(prefix) && path.length > prefix.length) {
                const segment = path.slice(prefix.length);
                return { definition, params: { path, query, segment } };
            }
        } else {
            // Exact match
            if (path === pattern || path === pattern + '/') {
                return { definition, params: { path, query } };
            }
        }
    }

    return undefined;
}
