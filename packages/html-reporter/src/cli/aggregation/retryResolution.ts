import type { DomainEvent } from '@serenity-js/core/events';
import { RetryableSceneDetected, SceneStarts } from '@serenity-js/core/events';
import type { Path } from '@serenity-js/core/io';
import type { CorrelationId } from '@serenity-js/core/model';
import { ExecutionSuccessful } from '@serenity-js/core/model';

import type { SceneRecord } from '../model/RunData.js';

/**
 * Groups domain events by sceneId.
 *
 * Events sharing the same sceneId form one execution.
 * Multiple sceneIds in a merged queue represent different executions
 * (e.g. cross-browser or cross-browser retries).
 *
 * @package
 */
export function groupEventsBySceneId(events: Array<DomainEvent & { sceneId: CorrelationId }>): Map<string, Array<DomainEvent & { sceneId: CorrelationId }>> {
    const groups = new Map<string, Array<DomainEvent & { sceneId: CorrelationId }>>();

    for (const event of events) {
        const id = event.sceneId.value;
        if (!groups.has(id)) {
            groups.set(id, []);
        }
        groups.get(id).push(event);
    }

    return groups;
}

interface SceneEntry {
    record: SceneRecord;
    sceneId: string;
}

/**
 * Resolves retry sequences from a list of scene records.
 *
 * Groups entries by project tag, then determines whether multiple entries
 * represent scenario outline examples or retry attempts.
 *
 * @package
 */
export function resolveRetries(
    records: SceneEntry[],
    events: Array<DomainEvent & { sceneId: CorrelationId }>,
    sceneArtifactPaths?: Map<string, Path[]>,
): SceneRecord[] {
    const scenes: SceneRecord[] = [];
    const byProject = new Map<string, SceneEntry[]>();

    for (const entry of records) {
        const project = entry.record.tags.find(t => t.type === 'project')?.name || '__default__';
        if (!byProject.has(project)) byProject.set(project, []);
        byProject.get(project)!.push(entry);
    }

    for (const [, projectEntries] of byProject) {
        if (projectEntries.length === 1) {
            const { record } = projectEntries[0];
            if (sceneArtifactPaths) {
                attachVideo(record, events, sceneArtifactPaths);
            }
            scenes.push(record);
        } else if (areScenarioOutlineExamples(projectEntries, events)) {
            const mergedRecord = mergeOutlineExamples(projectEntries, events, sceneArtifactPaths);
            scenes.push(mergedRecord);
        } else {
            const finalRecord = buildRetryRecord(projectEntries, events, sceneArtifactPaths);
            scenes.push(finalRecord);
        }
    }

    return scenes;
}

/**
 * Filters events to only those with a SceneStarts event.
 *
 * @package
 */
export function buildSceneRecords(
    eventsBySceneId: Map<string, Array<DomainEvent & { sceneId: CorrelationId }>>,
    buildRecord: (sceneEvents: Array<DomainEvent & { sceneId: CorrelationId }>) => SceneRecord,
): Array<{ record: SceneRecord; sceneId: string }> {
    const records: Array<{ record: SceneRecord; sceneId: string }> = [];

    for (const [sceneId, sceneEvents] of eventsBySceneId) {
        if (!sceneEvents.some(e => e instanceof SceneStarts)) {
            continue;
        }
        records.push({ record: buildRecord(sceneEvents), sceneId });
    }

    return records;
}

function areScenarioOutlineExamples(
    entries: SceneEntry[],
    events: Array<DomainEvent & { sceneId: CorrelationId }>,
): boolean {
    const hasOutlineData = entries.some(e => e.record.scenarioOutline !== undefined);
    if (!hasOutlineData) {
        return false;
    }

    const sceneIds = new Set(entries.map(e => e.sceneId));
    const hasRetryableSignal = events.some(
        e => e instanceof RetryableSceneDetected && sceneIds.has(e.sceneId.value),
    );

    return !hasRetryableSignal;
}

function mergeOutlineExamples(
    entries: SceneEntry[],
    events: Array<DomainEvent & { sceneId: CorrelationId }>,
    sceneArtifactPaths?: Map<string, Path[]>,
): SceneRecord {
    const finalEntry = entries[entries.length - 1];
    const mergedRecord = { ...finalEntry.record };

    const allParameters = entries.flatMap(
        e => e.record.scenarioOutline?.parameters ?? [],
    );

    const template = entries.find(e => e.record.scenarioOutline?.template)?.record.scenarioOutline?.template ?? '';

    mergedRecord.scenarioOutline = { template, parameters: allParameters };
    mergedRecord.activities = [];

    const worstOutcome = entries.reduce((worst, e) => {
        return (e.record.outcome.code < worst.code) ? e.record.outcome : worst;
    }, entries[0].record.outcome);
    mergedRecord.outcome = worstOutcome;

    mergedRecord.duration = entries.reduce((sum, e) => sum + e.record.duration, 0);

    delete (mergedRecord as any).retries;
    delete (mergedRecord as any).attempts;

    if (sceneArtifactPaths) {
        attachVideo(mergedRecord, events, sceneArtifactPaths);
    }

    return mergedRecord;
}

function buildRetryRecord(
    projectEntries: SceneEntry[],
    events: Array<DomainEvent & { sceneId: CorrelationId }>,
    sceneArtifactPaths?: Map<string, Path[]>,
): SceneRecord {
    const finalEntry = projectEntries[projectEntries.length - 1];
    const finalRecord = finalEntry.record;
    finalRecord.retries = projectEntries.length - 1;
    finalRecord.attempts = projectEntries.map(({ record: r, sceneId: sid }, i) => ({
        attemptNumber: i + 1,
        outcome: r.outcome,
        duration: r.duration,
        activities: r.activities,
        ...(r.error ? { error: r.error } : {}),
        ...(sceneArtifactPaths ? findVideo(sid, sceneArtifactPaths) : {}),
    }));
    finalRecord.activities = finalRecord.attempts[finalRecord.attempts.length - 1].activities;
    if (finalRecord.outcome.code === ExecutionSuccessful.Code) {
        delete finalRecord.error;
    }
    if (sceneArtifactPaths) {
        attachVideo(finalRecord, events, sceneArtifactPaths);
    }
    return finalRecord;
}

function attachVideo(record: SceneRecord, events: Array<DomainEvent & { sceneId: CorrelationId }>, sceneArtifactPaths: Map<string, Path[]>): void {
    for (const event of events) {
        const sceneIdValue = event.sceneId.value;
        if (sceneArtifactPaths.has(sceneIdValue)) {
            const videoPaths = sceneArtifactPaths.get(sceneIdValue).filter(p => p.value.endsWith('.webm'));
            if (videoPaths.length > 0) {
                record.video = videoPaths[0].value;
                return;
            }
        }
    }
}

function findVideo(sceneId: string, sceneArtifactPaths: Map<string, Path[]>): { video?: string } {
    if (sceneArtifactPaths.has(sceneId)) {
        const videoPaths = sceneArtifactPaths.get(sceneId).filter(p => p.value.endsWith('.webm'));
        if (videoPaths.length > 0) {
            return { video: videoPaths[0].value };
        }
    }
    return {};
}
