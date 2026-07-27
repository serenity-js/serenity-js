import { useEffect, useState } from 'preact/hooks';

import { type HashHistory, useHashHistory } from '../utils/index.js';

interface ViewStateOptions {
    basePath: string;
    route: string;
    defaults?: { search?: string; filter?: string; sort?: string };
}

interface ViewState {
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
    sort: string;
    setSort: (value: string) => void;
}

interface ViewStateDefaults {
    search: string;
    filter: string;
    sort: string;
}

interface ViewStateValues {
    search: string;
    filter: string;
    sort: string;
}

export function parseStateFromRoute(route: string, defaults: ViewStateDefaults): ViewStateValues {
    const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    return {
        search: params?.get('search') || defaults.search,
        filter: params?.get('filter') || defaults.filter,
        sort: params?.get('sort') || defaults.sort,
    };
}

export function syncStateToUrl(
    hashNav: HashHistory,
    basePath: string,
    state: ViewStateValues,
    defaults: ViewStateDefaults,
): void {
    const currentRoute = hashNav.getRoute();
    const currentParameters = currentRoute.includes('?')
        ? new URLSearchParams(currentRoute.split('?')[1])
        : new URLSearchParams();

    // Start from current extra params (those we don't own)
    const ownedKeys = new Set(['search', 'filter', 'sort']);
    const params = new URLSearchParams();
    for (const [key, value] of currentParameters.entries()) {
        if (!ownedKeys.has(key)) {
            params.set(key, value);
        }
    }

    // Set owned params
    if (state.search) params.set('search', state.search);
    if (state.filter && state.filter !== defaults.filter) params.set('filter', state.filter);
    if (state.sort && state.sort !== defaults.sort) params.set('sort', state.sort);

    const parameterString = params.toString();
    const newHash = parameterString ? basePath + '?' + parameterString : basePath;
    hashNav.replace(newHash);
}

export function useViewState({ basePath, route, defaults }: ViewStateOptions): ViewState {
    const hashNav = useHashHistory();
    const resolvedDefaults: ViewStateDefaults = {
        search: defaults?.search || '',
        filter: defaults?.filter || 'all',
        sort: defaults?.sort || 'category',
    };

    const [search, setSearch] = useState(() => hashNav.getParam('search') || resolvedDefaults.search);
    const [filter, setFilter] = useState(() => hashNav.getParam('filter') || resolvedDefaults.filter);
    const [sort, setSort] = useState(() => hashNav.getParam('sort') || resolvedDefaults.sort);

    // Sync from route when navigated externally
    useEffect(() => {
        const parsed = parseStateFromRoute(route, resolvedDefaults);
        setSearch(parsed.search);
        setFilter(parsed.filter);
        setSort(parsed.sort);
    }, [route]);

    // Sync back to hash URL on state change.
    // Preserves any params the hook doesn't own (e.g. `path`, `run`) by reading
    // them from the current URL rather than relying on a stale closure.
    useEffect(() => {
        syncStateToUrl(hashNav, basePath, { search, filter, sort }, resolvedDefaults);
    }, [search, filter, sort, basePath]);

    return { search, setSearch, filter, setFilter, sort, setSort };
}
