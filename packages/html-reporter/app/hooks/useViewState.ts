import { useEffect, useState } from 'preact/hooks';

import { useHashHistory } from '../utils';

interface ViewStateOptions {
    basePath: string;
    route: string;
    defaults?: { search?: string; filter?: string; sort?: string };
    extraParams?: () => Record<string, string>;
}

interface ViewState {
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
    sort: string;
    setSort: (value: string) => void;
}

export function useViewState({ basePath, route, defaults, extraParams }: ViewStateOptions): ViewState {
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

    // Sync back to hash URL on state change
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filter && filter !== defaultFilter) params.set('filter', filter);
        if (sort && sort !== defaultSort) params.set('sort', sort);
        if (extraParams) {
            for (const [key, value] of Object.entries(extraParams())) {
                if (value) params.set(key, value);
            }
        }
        const parameterString = params.toString();
        const newHash = parameterString ? basePath + '?' + parameterString : basePath;
        hashNav.replace(newHash);
    }, [search, filter, sort]);

    return { search, setSearch, filter, setFilter, sort, setSort };
}
