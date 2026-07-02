/**
 * Encapsulates hash-based URL manipulation so components don't need
 * to reference `window.history` or `window.location.hash` directly.
 *
 * This avoids a common pitfall where a `history` prop shadows
 * `window.history` after bundling/minification.
 */
export const hashHistory = {

    /** Returns the current hash route (without the leading `#`). */
    getRoute(): string {
        return (window.location.hash || '#/').slice(1);
    },

    /** Returns the path portion of the hash route (before the `?`). */
    getPath(): string {
        const route = this.getRoute();
        return route.includes('?') ? route.split('?')[0] : route;
    },

    /** Returns current query parameters from the hash route. */
    getParams(): URLSearchParams {
        const route = this.getRoute();
        return route.includes('?') ? new URLSearchParams(route.split('?')[1]) : new URLSearchParams();
    },

    /** Returns a single query parameter value from the hash route. */
    getParam(key: string): string | null {
        return this.getParams().get(key);
    },

    /** Sets a query parameter in the hash route (replaceState, no navigation). */
    setParam(key: string, value: string): void {
        const params = this.getParams();
        params.set(key, value);
        window.history.replaceState(null, '', '#' + this.getPath() + '?' + params.toString());
    },

    /** Removes a query parameter from the hash route (replaceState, no navigation). */
    deleteParam(key: string): void {
        const params = this.getParams();
        if (!params.has(key)) return;
        params.delete(key);
        const qs = params.toString();
        window.history.replaceState(null, '', '#' + this.getPath() + (qs ? '?' + qs : ''));
    },

    /** Replaces the full hash without triggering navigation (replaceState). */
    replace(hash: string): void {
        const target = hash.startsWith('#') ? hash : '#' + hash;
        if (window.location.hash !== target) {
            window.history.replaceState(null, '', target);
        }
    },

    /** Pushes a new hash entry to the browser history stack. */
    push(hash: string): void {
        const target = hash.startsWith('#') ? hash : '#' + hash;
        if (window.location.hash !== target) {
            window.history.pushState(null, '', target);
        }
    },
};

/** Alias for hashHistory — provides the same API as a hook for consistency with component conventions. */
export const useHashHistory = () => hashHistory;
