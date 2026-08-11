import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../src/cli/reporting/ReportData.js';
import type { FilterDefinition } from '../components/common/FilterBar.js';
import { computeFilterCounts, computeFilteredScenarios, groupByCategory } from '../utils/scenarioFiltering.js';
import { matchesSearch } from '../utils/tag-search.js';

function reconstructHistoricalScenarios(allScenarios: ReportScenario[], runTimestamp: string): ReportScenario[] {
    return allScenarios
        .filter(s => s.executionHistory?.some(e => e.timestamp === runTimestamp))
        .map(s => {
            const entry = s.executionHistory.find(e => e.timestamp === runTimestamp);
            return entry
                ? { ...s, outcome: entry.outcome, duration: entry.duration ?? s.duration, error: entry.error || undefined } as ReportScenario
                : s;
        });
}

interface ScenarioFilterOptions {
    allScenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    runIndex: number | null;
    isHistorical: boolean;
    search: string;
    filter: string;
    sort: string;
}

interface ScenarioFilterResult {
    filtered: ReportScenario[];
    grouped: Record<string, ReportScenario[]>;
    filters: FilterDefinition[];
    scenarioTotal: number;
}

export function useScenarioFilter({ allScenarios, history, runIndex, isHistorical, search, filter, sort }: ScenarioFilterOptions): ScenarioFilterResult {
    const baseScenarios = useMemo(() => {
        if (isHistorical && runIndex !== null && history[runIndex]) {
            return reconstructHistoricalScenarios(allScenarios, history[runIndex].timestamp);
        }
        return allScenarios;
    }, [runIndex, isHistorical]);

    const searchMatched = useMemo(
        () => search ? baseScenarios.filter(s => matchesSearch(s, search)) : baseScenarios,
        [baseScenarios, search]
    );

    const filterCounts = useMemo(
        () => computeFilterCounts(searchMatched),
        [searchMatched]
    );

    const filtered = useMemo(
        () => computeFilteredScenarios(searchMatched, filter, '', sort),
        [searchMatched, filter, sort]
    );

    const grouped = useMemo(
        () => groupByCategory(filtered),
        [filtered]
    );

    const scenarioTotal = useMemo(
        () => baseScenarios.length,
        [baseScenarios]
    );

    const filters: FilterDefinition[] = [
        { key: 'all', label: 'All', count: filterCounts.total },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ];

    return { filtered, grouped, filters, scenarioTotal };
}
