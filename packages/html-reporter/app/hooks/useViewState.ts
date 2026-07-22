import { useEffect, useState } from 'preact/hooks';

import { useHashHistory } from '../utils';

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

export function useViewState({ basePath, route, defaults }: ViewStateOptions): ViewState {
    const hashNav = useHashHistory();
    const defaultSearch = defaults?.search || '';
    const defaultFilter = defaults?.filter || 'all';
    const defaultSort = defaults?.sort || 'category';

    const [search, setSearch] = useState(() => hashNav.getParam('search') || defaultSearch);
    const [filter, setFilter] = useState(() => hashNav.getParam('filter') || defaultFilter);
    const [sort, setSort] = useState(() => hashNav.getParam('sort') || defaultSort);

    // Sync from route when navigated externally
    useEffect(() => {
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        setSearch(params?.get('search') || defaultSearch);
        setFilter(params?.get('filter') || defaultFilter);
        setSort(params?.get('sort') || defaultSort);
    }, [route]);

    // Sync back to hash URL on state change.
    // Preserves any params the hook doesn't own (e.g. `path`, `run`) by reading
    // them from the current URL rather than relying on a stale closure.
    useEffect(() => {
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
        if (search) params.set('search', search);
        if (filter && filter !== defaultFilter) params.set('filter', filter);
        if (sort && sort !== defaultSort) params.set('sort', sort);

        const parameterString = params.toString();
        const newHash = parameterString ? basePath + '?' + parameterString : basePath;
        hashNav.replace(newHash);
    }, [search, filter, sort, basePath]);

    return { search, setSearch, filter, setFilter, sort, setSort };
}
