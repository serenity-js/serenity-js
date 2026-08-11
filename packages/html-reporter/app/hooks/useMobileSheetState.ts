import { useState } from 'preact/hooks';

export interface MobileSheetState {
    filterSheetOpen: boolean;
    sortSheetOpen: boolean;
    statsSheetOpen: boolean;
    openFilter: () => void;
    closeFilter: () => void;
    openSort: () => void;
    closeSort: () => void;
    openStats: () => void;
    closeStats: () => void;
}

export function useMobileSheetState(): MobileSheetState {
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [sortSheetOpen, setSortSheetOpen] = useState(false);
    const [statsSheetOpen, setStatsSheetOpen] = useState(false);

    return {
        filterSheetOpen,
        sortSheetOpen,
        statsSheetOpen,
        openFilter: () => setFilterSheetOpen(true),
        closeFilter: () => setFilterSheetOpen(false),
        openSort: () => setSortSheetOpen(true),
        closeSort: () => setSortSheetOpen(false),
        openStats: () => setStatsSheetOpen(true),
        closeStats: () => setStatsSheetOpen(false),
    };
}
