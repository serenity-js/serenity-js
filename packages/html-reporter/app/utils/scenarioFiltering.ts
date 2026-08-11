import type { ReportScenario } from '../../src/cli/reporting/ReportData.js';
import { matchesOutcomeFilter } from './selectors.js';
import { matchesSearch } from './tag-search.js';

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

export interface FilterCounts {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
}

/**
 * Applies outcome filter, search, and sort to a list of scenarios.
 * Returns a new sorted array — does not mutate the input.
 */
export function computeFilteredScenarios(scenarios: ReportScenario[], filter: string, search: string, sort: string): ReportScenario[] {
    let result = scenarios;

    if (filter && filter !== 'all') {
        result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
    }
    if (search) {
        result = result.filter(s => matchesSearch(s, search));
    }
    return sortScenarios(result, sort);
}

/**
 * Counts scenarios by outcome category (passed, failed, skipped).
 * ERROR and COMPROMISED count as failed; PENDING counts as skipped.
 */
export function computeFilterCounts(scenarios: ReportScenario[]): FilterCounts {
    let passed = 0, failed = 0, skipped = 0;
    for (const s of scenarios) {
        if (matchesOutcomeFilter(s.outcome, 'passed')) passed++;
        else if (matchesOutcomeFilter(s.outcome, 'failed')) failed++;
        else if (matchesOutcomeFilter(s.outcome, 'skipped')) skipped++;
    }
    return { total: scenarios.length, passed, failed, skipped };
}

/**
 * Groups scenarios by their category field.
 * Returns an object mapping category names to arrays of scenarios.
 */
export function groupByCategory(scenarios: ReportScenario[]): Record<string, ReportScenario[]> {
    const groups: Record<string, ReportScenario[]> = {};
    for (const s of scenarios) {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    }
    return groups;
}
