import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { ReportActivity, ReportAttempt, ReportError, ReportExecutionHistoryEntry, ReportHistoryEntry, ReportScenario } from '../../src/ReportData';
import { resolveRunIndex, useHashHistory } from '../utils';

export interface ScenarioDetailState {
    scenario: ReportScenario | null;
    runIndex: number | null;
    activeAttempt: number;
    setActiveAttempt: (n: number) => void;
    currentActivities: ReportActivity[];
    currentError: ReportError | null;
    currentVideo: string | undefined;
    historicalEntry: ReportExecutionHistoryEntry | null;
    errorLocation: { path: string; line: number; column: number } | null;
    activeAttempts: ReportAttempt[] | null;
    hasRetries: boolean;
    activeDuration: number;
    tags: ReportScenario['tags'];
    cast: NonNullable<ReportScenario['cast']>;
    executionHistory: ReportScenario['executionHistory'];
    hasCast: boolean;
    hasTags: boolean;
    hasExecutionHistory: boolean;
}

function findErrorLocation(activities: ReportActivity[]): { path: string; line: number; column: number } | null {
    for (const a of activities) {
        if (a.outcome !== 'SUCCESS' && a.outcome !== 'SKIPPED' && a.location) return a.location;
        if (a.children) {
            const result = findErrorLocation(a.children);
            if (result) return result;
        }
    }
    return null;
}

export function useScenarioDetail(scenarioId: string, scenarios: ReportScenario[], history: ReportHistoryEntry[]): ScenarioDetailState {
    const hashNav = useHashHistory();
    const { cleanId, runString, attemptString, projectString, browserString, platformString } = parseScenarioParameters(scenarioId);
    const runIndex = useMemo(() => resolveRunIndex(runString, history), [runString]);

    const scenario = useMemo(
        () => findMatchingScenario(scenarios, cleanId, projectString, browserString, platformString),
        [scenarios, cleanId, projectString, browserString, platformString],
    );

    const [activeAttempt, setActiveAttempt] = useState(() => {
        if (attemptString) {
            const parsed = parseInt(attemptString, 10);
            return isNaN(parsed) ? 0 : parsed - 1;
        }
        return 0;
    });

    // Reset attempt selection when switching between runs (skip initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setActiveAttempt(0);
        hashNav.deleteParam('attempt');
    }, [runIndex]);

    // Sync attempt selection from URL (for deep linking)
    useEffect(() => {
        if (attemptString) {
            const parsed = parseInt(attemptString, 10);
            if (!isNaN(parsed) && parsed - 1 !== activeAttempt) {
                setActiveAttempt(parsed - 1);
            }
        }
    }, [attemptString]);

    if (!scenario) {
        return {
            scenario: null, runIndex, activeAttempt, setActiveAttempt,
            currentActivities: [], currentError: null, currentVideo: undefined,
            historicalEntry: null, errorLocation: null, activeAttempts: null,
            hasRetries: false, activeDuration: 0, tags: [], cast: [],
            executionHistory: [], hasCast: false, hasTags: false,
            hasExecutionHistory: false,
        };
    }

    const viewData = resolveScenarioViewData(scenario, runIndex, activeAttempt, history);

    return {
        scenario, runIndex, activeAttempt, setActiveAttempt,
        ...viewData,
    };
}

function parseScenarioParameters(scenarioId: string) {
    const cleanId = scenarioId.split('?')[0];
    const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
    return {
        cleanId,
        runString: params?.get('run') ?? null,
        attemptString: params?.get('attempt') ?? null,
        projectString: params?.get('project') ?? null,
        browserString: params?.get('browser') ?? null,
        platformString: params?.get('platform') ?? null,
    };
}

function findMatchingScenario(
    scenarios: ReportScenario[], cleanId: string, projectString: string | null, browserString: string | null, platformString: string | null,
): ReportScenario | null {
    return scenarios.find(s => {
        const sourceKey = s.source.line
            ? s.source.path + ':' + s.source.line
            : s.source.path + ':' + s.name;
        const idMatch = sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
        if (!idMatch) return false;
        const tags = s.tags || [];
        if (browserString && !tags.some(t => t.type === 'browser' && t.name === browserString)) return false;
        if (projectString && !tags.some(t => t.type === 'project' && t.name === projectString)) return false;
        if (platformString && !tags.some(t => t.type === 'platform' && t.name === platformString)) return false;
        return true;
    }) || null;
}

function resolveScenarioViewData(scenario: ReportScenario, runIndex: number | null, activeAttempt: number, history: ReportHistoryEntry[]) {
    const tags = scenario.tags || [];
    const cast = scenario.cast || [];
    const executionHistory = scenario.executionHistory || [];

    const historicalEntry = resolveHistoricalEntry(runIndex, history, executionHistory);

    const activeAttempts = historicalEntry
        ? (historicalEntry.attempts || null)
        : (scenario.attempts || null);
    const hasRetries = !!(activeAttempts && activeAttempts.length > 0);
    const activeDuration = historicalEntry && historicalEntry.duration != null
        ? historicalEntry.duration
        : scenario.duration;

    const { currentActivities, currentError, currentVideo } = resolveActiveContent(
        scenario, historicalEntry, activeAttempts, activeAttempt, hasRetries,
    );

    const errorLocation = currentError ? findErrorLocation(currentActivities) : null;

    return {
        currentActivities, currentError, currentVideo,
        historicalEntry, errorLocation, activeAttempts,
        hasRetries, activeDuration, tags, cast, executionHistory,
        hasCast: cast.length > 0,
        hasTags: tags.length > 0,
        hasExecutionHistory: executionHistory.length > 0,
    };
}

function resolveHistoricalEntry(
    runIndex: number | null, history: ReportHistoryEntry[], executionHistory: ReportExecutionHistoryEntry[],
): ReportExecutionHistoryEntry | null {
    if (runIndex === null || runIndex === history.length - 1) return null;
    return executionHistory[runIndex] || null;
}

function resolveActiveContent(
    scenario: ReportScenario,
    historicalEntry: ReportExecutionHistoryEntry | null,
    activeAttempts: ReportAttempt[] | null,
    activeAttempt: number,
    hasRetries: boolean,
) {
    const activeAttemptData = hasRetries && activeAttempts && activeAttempt < activeAttempts.length
        ? activeAttempts[activeAttempt]
        : null;

    if (activeAttemptData) {
        return {
            currentActivities: activeAttemptData.activities,
            currentError: activeAttemptData.error || null,
            currentVideo: activeAttemptData.video || undefined,
        };
    }

    if (historicalEntry) {
        return {
            currentActivities: historicalEntry.activities || scenario.activities || [],
            currentError: historicalEntry.error || null,
            currentVideo: scenario.video,
        };
    }

    return {
        currentActivities: scenario.activities || [],
        currentError: scenario.error || null,
        currentVideo: scenario.video,
    };
}
