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
    treeKey: number;
    setTreeKey: (fn: (k: number) => number) => void;
    treeExpanded: boolean;
    setTreeExpanded: (v: boolean) => void;
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
    const cleanId = scenarioId.split('?')[0];
    const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
    const runString = params?.get('run');
    const attemptString = params?.get('attempt');
    const runIndex = useMemo(() => resolveRunIndex(runString ?? null, history), [runString]);

    const projectString = params?.get('project');
    const browserString = params?.get('browser');

    const scenario = scenarios.find(s => {
        const sourceKey = s.source.line
            ? s.source.path + ':' + s.source.line
            : s.source.path + ':' + s.name;
        const idMatch = sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
        if (!idMatch) return false;
        if (browserString) {
            return (s.tags || []).some(t => t.type === 'browser' && t.name === browserString);
        }
        if (projectString) {
            return (s.tags || []).some(t => t.type === 'project' && t.name === projectString);
        }
        return true;
    }) || null;

    const [activeAttempt, setActiveAttempt] = useState(() => {
        if (attemptString) {
            const parsed = parseInt(attemptString, 10);
            return isNaN(parsed) ? 0 : parsed - 1;
        }
        return 0;
    });
    const [treeKey, setTreeKey] = useState(0);
    const [treeExpanded, setTreeExpanded] = useState(true);

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
            hasExecutionHistory: false, treeKey, setTreeKey, treeExpanded, setTreeExpanded,
        };
    }

    const tags = scenario.tags || [];
    const cast = scenario.cast || [];
    const activities = scenario.activities || [];
    const executionHistory = scenario.executionHistory || [];

    const historicalEntry = runIndex !== null && runIndex !== history.length - 1 && executionHistory[runIndex]
        ? executionHistory[runIndex] : null;

    const activeAttempts = historicalEntry
        ? (historicalEntry.attempts || null)
        : (scenario.attempts || null);
    const hasRetries = !!(activeAttempts && activeAttempts.length > 0);
    const activeDuration = historicalEntry && historicalEntry.duration != null
        ? historicalEntry.duration
        : scenario.duration;

    const activeAttemptData = hasRetries && activeAttempt < activeAttempts!.length
        ? activeAttempts![activeAttempt]
        : null;

    const currentActivities = activeAttemptData
        ? activeAttemptData.activities
        : historicalEntry && historicalEntry.activities
            ? historicalEntry.activities
            : activities;

    const currentError = activeAttemptData
        ? (activeAttemptData.error || null)
        : historicalEntry
            ? (historicalEntry.error || null)
            : (scenario.error || null);

    const currentVideo = activeAttemptData
        ? (activeAttemptData.video || undefined)
        : scenario.video;

    const errorLocation = currentError ? findErrorLocation(currentActivities) : null;

    return {
        scenario, runIndex, activeAttempt, setActiveAttempt,
        currentActivities, currentError, currentVideo,
        historicalEntry, errorLocation, activeAttempts,
        hasRetries, activeDuration, tags, cast, executionHistory,
        hasCast: cast.length > 0,
        hasTags: tags.length > 0,
        hasExecutionHistory: executionHistory.length > 0,
        treeKey, setTreeKey, treeExpanded, setTreeExpanded,
    };
}
