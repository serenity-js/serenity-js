import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../src/cli/reporting/ReportData.js';
import type { FilterDefinition } from '../components/common/FilterBar.js';
import { matchesOutcomeFilter, matchesSearch } from '../utils/index.js';

const STATUS_ORDER: Record<string, number> = { FAILURE: 1, ERROR: 2, COMPROMISED: 3, PENDING: 4, SKIPPED: 5, SUCCESS: 6 };

const sortComparators: Record<string, (a: ReportScenario, b: ReportScenario) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    duration: (a, b) => b.duration - a.duration,
    status: (a, b) => (STATUS_ORDER[a.outcome] || 6) - (STATUS_ORDER[b.outcome] || 6),
    category: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
};

function sortScenarios(scenarios: ReportScenario[], sort: string): ReportScenario[] {
    const comparator = sortComparators[sort] || sortComparators.category;
    return [...scenarios].sort(comparator);
}

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
    const filtered = useMemo(() => {
        let result = allScenarios;

        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            result = reconstructHistoricalScenarios(allScenarios, runTimestamp);
        }

        if (filter && filter !== 'all') {
            result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
        }
        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        return sortScenarios(result, sort);
    }, [search, filter, sort, runIndex, isHistorical]);

    const grouped = useMemo(() => {
        const groups: Record<string, ReportScenario[]> = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    // Compute scenarios matching the current search (before outcome filter)
    // so filter chip counts reflect the narrowed search results
    const searchMatched = useMemo(() => {
        let result = allScenarios;

        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            result = reconstructHistoricalScenarios(allScenarios, runTimestamp);
        }

        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        return result;
    }, [search, runIndex, isHistorical]);

    const filterCounts = useMemo(() => {
        let passed = 0, failed = 0, skipped = 0;
        for (const s of searchMatched) {
            if (matchesOutcomeFilter(s.outcome, 'passed')) passed++;
            else if (matchesOutcomeFilter(s.outcome, 'failed')) failed++;
            else if (matchesOutcomeFilter(s.outcome, 'skipped')) skipped++;
        }
        return { total: searchMatched.length, passed, failed, skipped };
    }, [searchMatched]);

    // Total scenarios available in the run (before any search/filter)
    const scenarioTotal = useMemo(() => {
        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            return allScenarios.filter(s => s.executionHistory?.some(e => e.timestamp === runTimestamp)).length;
        }
        return allScenarios.length;
    }, [runIndex, isHistorical]);

    const filters: FilterDefinition[] = [
        { key: 'all', label: 'All', count: filterCounts.total },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ];

    return { filtered, grouped, filters, scenarioTotal };
}
