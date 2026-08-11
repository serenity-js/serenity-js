import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry } from '../../src/cli/reporting/ReportData.js';
import { resolveRunIndex, targetValue } from '../utils/index.js';

interface RunSelection {
    runIndex: number | null;
    isHistorical: boolean;
    historicalRun: ReportHistoryEntry | null;
    activeTimestamp: string | null;
    onRunChange: (e: Event) => void;
}

export function useRunSelection(route: string, history: ReportHistoryEntry[], basePath: string, onNavigate: (path: string) => void): RunSelection {
    const runParameters = (route && route.includes('?')) ? new URLSearchParams(route.split('?')[1]) : null;
    const runString = runParameters ? runParameters.get('run') : null;
    const runIndex = useMemo(() => resolveRunIndex(runString, history), [runString]);

    const isHistorical = runIndex !== null && runIndex !== history.length - 1;
    const historicalRun = isHistorical ? history[runIndex] : null;
    const activeTimestamp = runIndex !== null && history[runIndex] ? history[runIndex].timestamp : history[history.length - 1]?.timestamp || null;

    const onRunChange = (event: Event) => {
        const timestamp = targetValue(event);
        const index = history.findIndex(r => r.timestamp === timestamp);
        const isLatest = index === history.length - 1;

        // Read current params from the live URL (not the stale route prop)
        // because useViewState.syncStateToUrl may have updated the hash
        // without triggering a route prop update yet.
        const currentHash = window.location.hash.replace(/^#/, '');
        const currentParameters = currentHash.includes('?')
            ? new URLSearchParams(currentHash.split('?')[1])
            : new URLSearchParams();
        currentParameters.delete('run');

        if (!isLatest) {
            currentParameters.set('run', timestamp);
        }

        const parameterString = currentParameters.toString();
        onNavigate(parameterString ? basePath + '?' + parameterString : basePath);
    };

    return { runIndex, isHistorical, historicalRun, activeTimestamp, onRunChange };
}
