import type { DomainEventQueues, Timestamp } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    ActivityRelatedArtifactGenerated,
    FeatureNarrativeDetected,
    InteractionFinished,
    InteractionStarts,
    SceneDescriptionDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TaskFinished,
    TaskStarts,
} from '@serenity-js/core/events';
import type { Path } from '@serenity-js/core/io';
import type { CorrelationId } from '@serenity-js/core/model';
import type { SerialisedOutcome } from '@serenity-js/core/model';
import {
    ProblemIndication,
} from '@serenity-js/core/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
} from '@serenity-js/core/model';

import type { ActivityRecord, ArtifactReference, ErrorRecord, OutcomeCounts, RunData, ScenarioParameterSet, SceneRecord, TagRecord } from './model/RunData.js';
import type { SystemContext } from './SystemContextDetector.js';

/**
 * Transforms DomainEventQueues into the RunData model.
 *
 * @package
 */
export class SceneDataCollector {

    collect(
        queues: DomainEventQueues,
        testRunStartedAt: string,
        testRunnerName: string,
        testRunnerVersion: string,
        artifactPaths: Map<string, Path[]>,
        systemContext: SystemContext,
        sceneArtifactPaths?: Map<string, Path[]>,
    ): RunData {
        const scenes: SceneRecord[] = [];

        queues.forEach(queue => {
            const events = queue.drain();

            // A merged queue may contain events from multiple sceneIds
            // (cross-browser runs and retries). Split by sceneId first,
            // then group retries (same project) into a single scene with attempts.
            const eventsBySceneId = this.groupEventsBySceneId(events);
            const records: SceneRecord[] = [];

            for (const [, sceneEvents] of eventsBySceneId) {
                records.push(new SceneRecordBuilder(artifactPaths).build(sceneEvents));
            }

            // Group records by project tag to identify retries
            const byProject = new Map<string, SceneRecord[]>();
            for (const record of records) {
                const project = record.tags.find(t => t.type === 'project')?.name || '__default__';
                if (!byProject.has(project)) byProject.set(project, []);
                byProject.get(project).push(record);
            }

            for (const [, projectRecords] of byProject) {
                if (projectRecords.length === 1) {
                    const record = projectRecords[0];
                    if (sceneArtifactPaths) {
                        this.attachVideo(record, events, sceneArtifactPaths);
                    }
                    scenes.push(record);
                } else {
                    // Multiple records for the same project = retries
                    const finalRecord = projectRecords[projectRecords.length - 1];
                    finalRecord.retries = projectRecords.length - 1;
                    finalRecord.attempts = projectRecords.map((r, i) => ({
                        attemptNumber: i + 1,
                        outcome: r.outcome,
                        duration: r.duration,
                        activities: r.activities,
                        ...(r.error ? { error: r.error } : {}),
                    }));
                    // Final attempt's activities become the scene's activities
                    finalRecord.activities = finalRecord.attempts[finalRecord.attempts.length - 1].activities;
                    // Clear scene-level error if final attempt succeeded
                    if (finalRecord.outcome.code === ExecutionSuccessful.Code) {
                        delete finalRecord.error;
                    }
                    if (sceneArtifactPaths) {
                        this.attachVideo(finalRecord, events, sceneArtifactPaths);
                    }
                    scenes.push(finalRecord);
                }
            }
        });

        const startedAt = scenes.length > 0
            ? scenes.reduce((earliest, s) => s.startedAt < earliest ? s.startedAt : earliest, scenes[0].startedAt)
            : testRunStartedAt;

        const finishedAt = scenes.length > 0
            ? new Date(scenes.reduce((latest, s) => {
                const end = new Date(s.startedAt).getTime() + s.duration;
                return end > latest ? end : latest;
            }, 0)).toISOString()
            : testRunStartedAt;

        return {
            startedAt,
            finishedAt,
            outcomes: this.summariseOutcomes(scenes),
            scenes,
            tags: this.collectUniqueTags(scenes),
            testRunner: { name: testRunnerName, version: testRunnerVersion },
            systemContext,
        };
    }

    private attachVideo(record: SceneRecord, events: Array<DomainEvent & { sceneId: CorrelationId }>, sceneArtifactPaths: Map<string, Path[]>): void {
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

    private groupEventsBySceneId(events: Array<DomainEvent & { sceneId: CorrelationId }>): Map<string, Array<DomainEvent & { sceneId: CorrelationId }>> {
        // Group events by sceneId. Events sharing the same sceneId form one execution.
        // Multiple sceneIds in a merged queue represent different executions
        // (e.g. cross-browser or cross-browser retries).
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

    private summariseOutcomes(scenes: SceneRecord[]): OutcomeCounts {
        const counts: OutcomeCounts = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
        for (const scene of scenes) {
            const label = outcomeCodeToLabel(scene.outcome.code);
            counts[label]++;
        }
        return counts;
    }

    private collectUniqueTags(scenes: SceneRecord[]): TagRecord[] {
        const seen = new Set<string>();
        const tags: TagRecord[] = [];
        for (const scene of scenes) {
            for (const tag of scene.tags) {
                const key = `${tag.type}:${tag.name}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    tags.push(tag);
                }
            }
        }
        return tags;
    }
}

/**
 * Builds a single SceneRecord from a sequence of domain events.
 *
 * @package
 */
class SceneRecordBuilder {
    private name: string;
    private category: string;
    private sourcePath: string;
    private sourceLine: number;
    private startedAt: string;
    private sceneStartTimestamp: Timestamp;
    private outcome: SerialisedOutcome;
    private duration = 0;
    private narrative: string | undefined;
    private description: string | undefined;
    private readonly tags: TagRecord[] = [];
    private readonly activityStack: Array<{ record: ActivityRecord; startTimestamp: Timestamp }> = [];
    private rootActivities: ActivityRecord[] = [];
    private readonly artifacts: ArtifactReference[] = [];
    private sceneError: ErrorRecord | undefined;

    // Scenario outline support
    private isScenarioOutline = false;
    private template: string | undefined;
    private readonly parameterSets: ScenarioParameterSet[] = [];
    private currentParameterSet: { name: string; description?: string; values: Record<string, string> } | undefined;
    private currentExampleStartTimestamp: Timestamp | undefined;

    // Retry support
    private sceneFinishedCount = 0;
    private currentAttemptStartTimestamp: Timestamp | undefined;
    private readonly attempts: Array<{ attemptNumber: number; outcome: SerialisedOutcome; activities: ActivityRecord[]; error?: ErrorRecord; duration: number }> = [];

    constructor(private readonly artifactPaths: Map<string, Path[]>) {
    }

    build(events: Array<DomainEvent & { sceneId: CorrelationId }>): SceneRecord {
        for (const event of events) {
            this.processEvent(event);
        }

        if (!this.name) {
            throw new LogicError('SceneRecordBuilder received an event queue without a SceneStarts event');
        }

        const isRetried = this.attempts.length > 1;

        const record: SceneRecord = {
            name: this.name,
            category: this.category,
            outcome: this.outcome,
            duration: this.duration,
            startedAt: this.startedAt,
            source: { path: this.sourcePath, line: this.sourceLine },
            tags: this.tags,
            activities: isRetried
                ? this.attempts[this.attempts.length - 1].activities
                : (this.isScenarioOutline ? [] : this.rootActivities),
        };

        if (this.narrative) {
            record.narrative = this.narrative;
        }

        if (this.description) {
            record.description = this.description;
        }

        if (this.sceneError) {
            record.error = this.sceneError;
        }

        if (this.artifacts.length > 0) {
            record.artifacts = this.artifacts;
        }

        if (this.isScenarioOutline && this.template) {
            record.scenarioOutline = {
                template: this.template,
                parameters: this.parameterSets,
            };
        }

        if (isRetried) {
            record.retries = this.attempts.length - 1;
            record.attempts = this.attempts;
        }

        return record;
    }

    private processEvent(event: DomainEvent & { sceneId: CorrelationId }): void {
        if (event instanceof SceneSequenceDetected) {
            this.isScenarioOutline = true;
        } else if (event instanceof SceneTemplateDetected) {
            this.template = event.template.value;
        } else if (event instanceof SceneParametersDetected) {
            this.currentParameterSet = {
                name: event.parameters.name.value,
                description: event.parameters.description.value || undefined,
                values: event.parameters.values,
            };
        } else if (event instanceof SceneStarts) {
            this.handleSceneStarts(event);
        } else if (event instanceof SceneTagged) {
            this.tags.push({ type: event.tag.type, name: event.tag.name });
        } else if (event instanceof FeatureNarrativeDetected) {
            this.narrative = event.description.value;
        } else if (event instanceof SceneDescriptionDetected) {
            this.description = event.description.value;
        } else if (event instanceof TaskStarts || event instanceof InteractionStarts) {
            this.handleActivityStarts(event);
        } else if (event instanceof TaskFinished || event instanceof InteractionFinished) {
            this.handleActivityFinished(event);
        } else if (event instanceof ActivityRelatedArtifactGenerated) {
            this.handleArtifact(event);
        } else if (event instanceof SceneFinished) {
            this.handleSceneFinished(event);
        }
    }

    private handleSceneStarts(event: SceneStarts): void {
        if (!this.name) {
            // First SceneStarts sets the scene metadata
            this.name = event.details.name.value;
            this.category = event.details.category.value;
            this.sourcePath = event.details.location.path.value;
            this.sourceLine = event.details.location.line;
            this.startedAt = event.timestamp.toISOString();
            this.sceneStartTimestamp = event.timestamp;
            this.currentAttemptStartTimestamp = event.timestamp;
        } else if (!this.isScenarioOutline && this.sceneFinishedCount > 0) {
            // Subsequent SceneStarts after SceneFinished = retry attempt
            this.rootActivities = [];
            this.activityStack.length = 0;
            this.currentAttemptStartTimestamp = event.timestamp;
        }

        if (this.isScenarioOutline && this.currentParameterSet) {
            // Start collecting activities for this example row
            this.rootActivities = [];
            this.activityStack.length = 0;
            this.currentExampleStartTimestamp = event.timestamp;
        }
    }

    private handleActivityStarts(event: TaskStarts | InteractionStarts): void {
        const activity: ActivityRecord = {
            type: event instanceof TaskStarts ? 'Task' : 'Interaction',
            name: event.details.name.value,
            outcome: { code: ImplementationPending.Code },
            duration: 0,
            startedAt: event.timestamp.toJSON(),
            children: [],
            location: { path: event.details.location.path.value, line: event.details.location.line, column: event.details.location.column },
        };

        if (this.activityStack.length > 0) {
            this.activityStack[this.activityStack.length - 1].record.children.push(activity);
        } else {
            this.rootActivities.push(activity);
        }

        this.activityStack.push({ record: activity, startTimestamp: event.timestamp });
    }

    private handleActivityFinished(event: TaskFinished | InteractionFinished): void {
        const entry = this.activityStack.pop();
        if (!entry) {
            return;
        }

        entry.record.outcome = event.outcome.toJSON();
        entry.record.duration = event.timestamp.diff(entry.startTimestamp).inMilliseconds();

        if (event.outcome instanceof ProblemIndication) {
            entry.record.error = errorFrom(event.outcome);
        }

        const activityArtifacts = this.artifactPaths.get(event.activityId.value);
        if (activityArtifacts) {
            entry.record.artifacts = activityArtifacts.map(p => ({ path: p.value, type: 'screenshot' }));
        }
    }

    private handleArtifact(event: ActivityRelatedArtifactGenerated): void {
        const paths = this.artifactPaths.get(event.activityId.value);
        if (paths) {
            for (const p of paths) {
                if (!this.artifacts.some(a => a.path === p.value)) {
                    this.artifacts.push({ path: p.value, type: 'screenshot', activityId: event.activityId.value });
                }
            }
        }
    }

    private handleSceneFinished(event: SceneFinished): void {
        this.sceneFinishedCount++;

        if (this.isScenarioOutline && this.currentParameterSet) {
            this.parameterSets.push({
                name: this.currentParameterSet.name,
                description: this.currentParameterSet.description,
                values: this.currentParameterSet.values,
                outcome: event.outcome.toJSON(),
                duration: event.timestamp.diff(this.currentExampleStartTimestamp).inMilliseconds(),
                activities: this.rootActivities,
            });
            this.currentParameterSet = undefined;
        } else {
            // Record this attempt (for both regular and retried scenarios)
            const attemptError = event.outcome instanceof ProblemIndication ? errorFrom(event.outcome) : undefined;
            this.attempts.push({
                attemptNumber: this.sceneFinishedCount,
                outcome: event.outcome.toJSON(),
                activities: this.rootActivities,
                duration: event.timestamp.diff(this.currentAttemptStartTimestamp).inMilliseconds(),
                ...(attemptError ? { error: attemptError } : {}),
            });
        }

        // Always update the overall scene outcome/duration to the last one
        this.outcome = event.outcome.toJSON();
        this.duration = event.timestamp.diff(this.sceneStartTimestamp).inMilliseconds();

        // Only set scene-level error if final outcome is a failure
        if (event.outcome instanceof ProblemIndication) {
            this.sceneError = errorFrom(event.outcome);
        } else {
            // Clear any previous error if final attempt succeeded
            this.sceneError = undefined;
        }
    }
}

function outcomeCodeToLabel(code: number): keyof OutcomeCounts {
    if (code === ExecutionSuccessful.Code) return 'passed';
    if (code === ExecutionFailedWithAssertionError.Code) return 'failed';
    if (code === ExecutionFailedWithError.Code) return 'error';
    if (code === ExecutionCompromised.Code) return 'compromised';
    if (code === ImplementationPending.Code) return 'pending';
    if (code === ExecutionSkipped.Code) return 'skipped';
    return 'error';
}

function errorFrom(outcome: ProblemIndication): ErrorRecord {
    return {
        name: outcome.error.name,
        message: outcome.error.message,
        stack: outcome.error.stack || '',
    };
}
