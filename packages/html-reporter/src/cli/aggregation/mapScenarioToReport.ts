import { ExecutionSuccessful } from '@serenity-js/core/model';
import { marked } from 'marked';

import { findHistoricalMatch, resolveRunLabel } from '../model/index.js';
import { outcomeCodeToDisplayString } from '../model/outcomes.js';
import type { ActivityRecord, RunData, SceneRecord } from '../model/RunData.js';
import type {
    ReportActivity,
    ReportExecutionHistoryEntry,
    ReportScenario,
} from '../reporting/ReportData.js';

/**
 * Maps a SceneRecord to a ReportScenario with enriched data including
 * execution history across all runs.
 *
 * @internal
 */
export function enrichSingleScenario(scene: SceneRecord, executionHistory: ReportExecutionHistoryEntry[]): ReportScenario {
    const enriched: ReportScenario = {
        name: scene.name,
        category: scene.category,
        outcome: outcomeCodeToDisplayString(scene.outcome.code),
        duration: scene.duration,
        startedAt: scene.startedAt,
        source: scene.source,
        tags: [...new Map(scene.tags.map(t => [t.type + ':' + t.name, t])).values()],
        activities: scene.activities.map(activity => mapActivityOutcome(activity)),
        executionHistory,
    };

    if (scene.narrative) {
        enriched.narrative = marked.parse(scene.narrative, { async: false }) as string;
    }
    if (scene.description) {
        enriched.description = marked.parse(scene.description, { async: false }) as string;
    }
    if (scene.error) {
        enriched.error = scene.error;
    }
    if (scene.cast) {
        enriched.cast = scene.cast;
    }
    if (scene.video) {
        enriched.video = scene.video;
    }
    if (scene.scenarioOutline) {
        enriched.scenarioOutline = {
            template: scene.scenarioOutline.template,
            parameters: scene.scenarioOutline.parameters.map(ps => ({
                ...ps,
                ...(ps.description ? { description: marked.parse(ps.description, { async: false }) as string } : {}),
                outcome: outcomeCodeToDisplayString(ps.outcome.code),
                activities: ps.activities.map(activity => mapActivityOutcome(activity)),
            })),
        };
    }
    if (scene.attempts) {
        enriched.retries = scene.retries;
        enriched.attempts = scene.attempts.map(attempt => ({
            ...attempt,
            outcome: outcomeCodeToDisplayString(attempt.outcome.code),
            activities: attempt.activities.map(activity => mapActivityOutcome(activity)),
        }));
    }

    return enriched;
}

/**
 * Builds the execution history for a scene across all available runs.
 *
 * When multiple scenes in a historical run share the same base identity
 * (e.g., dynamically-generated tests at the same source line), the scene
 * name is used as a secondary disambiguator to match the correct entry.
 *
 * @internal
 */
export function buildExecutionHistory(scene: SceneRecord, allRuns: RunData[]): ReportExecutionHistoryEntry[] {
    return allRuns.map(run => {
        const match = findHistoricalMatch(scene, run.scenes);
        if (!match) return undefined;
        const entry: ReportExecutionHistoryEntry = {
            outcome: outcomeCodeToDisplayString(match.outcome.code),
            run: resolveRunLabel(run),
            timestamp: run.startedAt,
            duration: match.duration,
            activities: match.activities.map(activity => mapActivityOutcome(activity)),
        };
        if (match.error) {
            entry.error = match.error;
        }
        if (match.attempts && match.retries) {
            entry.retries = match.retries;
            entry.attempts = match.attempts.map(attempt => ({
                ...attempt,
                outcome: outcomeCodeToDisplayString(attempt.outcome.code),
                activities: attempt.activities.map(activity => mapActivityOutcome(activity)),
            }));
        }
        if (match.retries > 0 && match.outcome.code === ExecutionSuccessful.Code) {
            entry.retriedAndPassed = true;
        }
        return entry;
    }).filter(Boolean) as ReportExecutionHistoryEntry[];
}

/**
 * Maps an ActivityRecord (with numeric outcome code) to a ReportActivity
 * (with string outcome display name). Recursively maps child activities.
 *
 * @internal
 */
export function mapActivityOutcome(activity: ActivityRecord): ReportActivity {
    const mapped: ReportActivity = {
        name: activity.name,
        outcome: outcomeCodeToDisplayString(activity.outcome.code),
        duration: activity.duration,
        children: activity.children.map(child => mapActivityOutcome(child)),
    };

    if (activity.type) mapped.type = activity.type;
    if (activity.startedAt) mapped.startedAt = activity.startedAt;
    if (activity.location) mapped.location = activity.location;
    if (activity.error) mapped.error = activity.error;
    if (activity.artifacts) mapped.artifacts = activity.artifacts;
    if (activity.restQuery) mapped.restQuery = activity.restQuery;
    if (activity.reportData) mapped.reportData = activity.reportData;

    return mapped;
}
