import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

/**
 * Contract for hash-based URL manipulation.
 *
 * The default implementation operates on `window.location.hash` and `window.history`.
 * In tests, a mock can be provided via the `HashHistoryContext`.
 */
export interface HashHistory {
    /** Returns the current hash route (without the leading `#`). */
    getRoute(): string;

    /** Returns the path portion of the hash route (before the `?`). */
    getPath(): string;

    /** Returns current query parameters from the hash route. */
    getParams(): URLSearchParams;

    /** Returns a single query parameter value from the hash route. */
    getParam(key: string): string | null;

    /** Sets a query parameter in the hash route (replaceState, no navigation). */
    setParam(key: string, value: string): void;

    /** Removes a query parameter from the hash route (replaceState, no navigation). */
    deleteParam(key: string): void;

    /** Replaces the full hash without triggering navigation (replaceState). */
    replace(hash: string): void;

    /** Pushes a new hash entry to the browser history stack. */
    push(hash: string): void;
}

/**
 * Default implementation backed by `window.location` and `window.history`.
 */
export const hashHistory: HashHistory = {

    getRoute(): string {
        return (window.location.hash || '#/').slice(1);
    },

    getPath(): string {
        const route = this.getRoute();
        return route.includes('?') ? route.split('?')[0] : route;
    },

    getParams(): URLSearchParams {
        const route = this.getRoute();
        return route.includes('?') ? new URLSearchParams(route.split('?')[1]) : new URLSearchParams();
    },

    getParam(key: string): string | null {
        return this.getParams().get(key);
    },

    setParam(key: string, value: string): void {
        const params = this.getParams();
        params.set(key, value);
        window.history.replaceState(null, '', '#' + this.getPath() + '?' + params.toString());
    },

    deleteParam(key: string): void {
        const params = this.getParams();
        if (!params.has(key)) return;
        params.delete(key);
        const qs = params.toString();
        window.history.replaceState(null, '', '#' + this.getPath() + (qs ? '?' + qs : ''));
    },

    replace(hash: string): void {
        const target = hash.startsWith('#') ? hash : '#' + hash;
        if (window.location.hash !== target) {
            window.history.replaceState(null, '', target);
        }
    },

    push(hash: string): void {
        const target = hash.startsWith('#') ? hash : '#' + hash;
        if (window.location.hash !== target) {
            window.history.pushState(null, '', target);
        }
    },
};

/**
 * Preact context for providing a `HashHistory` instance.
 * Defaults to the real `hashHistory` so components work without an explicit provider.
 */
export const HashHistoryContext = createContext<HashHistory>(hashHistory);

/**
 * Hook to access the current `HashHistory` from context.
 */
export function useHashHistory(): HashHistory {
    return useContext(HashHistoryContext);
}
