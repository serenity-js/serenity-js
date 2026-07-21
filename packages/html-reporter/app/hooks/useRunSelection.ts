import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry } from '../../src/cli/ReportData';
import { resolveRunIndex, targetValue } from '../utils';

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
        onNavigate(isLatest ? basePath : basePath + '?run=' + timestamp);
    };

    return { runIndex, isHistorical, historicalRun, activeTimestamp, onRunChange };
}
