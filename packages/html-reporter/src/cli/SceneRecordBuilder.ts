import type { Timestamp } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    ActivityRelatedArtifactGenerated,
    ActorEntersStage,
    FeatureNarrativeDetected,
    InteractionFinished,
    InteractionStarts,
    RetryableSceneDetected,
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
import type { CorrelationId, SerialisedOutcome } from '@serenity-js/core/model';
import {
    ImplementationPending,
    ProblemIndication,
} from '@serenity-js/core/model';

import { dispatchArtifact } from './artifactHandlers.js';
import type { ActivityRecord, ActorRecord, ArtifactReference, ErrorRecord, ScenarioParameterSet, SceneRecord, TagRecord } from './model/RunData.js';
import { errorFrom, findErrorInActivities, serialiseOutcome } from './outcomeSerialisers.js';

export { errorFrom, outcomeCodeToLabel, serialiseOutcome } from './outcomeSerialisers.js';

/**
 * Builds a single SceneRecord from a sequence of domain events.
 *
 * @package
 */
export class SceneRecordBuilder {
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
    private readonly activityById = new Map<string, ActivityRecord>();
    private readonly artifacts: ArtifactReference[] = [];
    private readonly cast: ActorRecord[] = [];
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
    private isRetrySequence = false;

    constructor(private readonly artifactPaths: Map<string, Path[]>) {
    }

    build(events: Array<DomainEvent & { sceneId: CorrelationId }>): SceneRecord {
        for (const event of events) {
            this.processEvent(event);
        }

        if (!this.name) {
            throw new LogicError('SceneRecordBuilder received an event queue without a SceneStarts event');
        }

        this.normaliseRetrySequence();

        const isRetried = this.attempts.length > 1;
        const base = this.buildBaseRecord(isRetried);

        if (this.isScenarioOutline && this.template) {
            return { ...base, scenarioOutline: { template: this.template, parameters: this.parameterSets } } as SceneRecord;
        }

        if (isRetried) {
            return { ...base, retries: this.attempts.length - 1, attempts: this.attempts } as SceneRecord;
        }

        return base as SceneRecord;
    }

    private normaliseRetrySequence(): void {
        if (!(this.isRetrySequence && this.isScenarioOutline && this.parameterSets.length > 0)) {
            return;
        }

        for (let i = 0; i < this.parameterSets.length; i++) {
            const ps = this.parameterSets[i];
            const attemptError = findErrorInActivities(ps.activities);
            this.attempts.push({
                attemptNumber: i + 1,
                outcome: ps.outcome,
                duration: ps.duration,
                activities: ps.activities,
                ...(attemptError ? { error: attemptError } : {}),
            });
        }
        this.isScenarioOutline = false;
    }

    private buildBaseRecord(isRetried: boolean) {
        return {
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
            ...(this.narrative ? { narrative: this.narrative } : {}),
            ...(this.description ? { description: this.description } : {}),
            ...(this.sceneError ? { error: this.sceneError } : {}),
            ...(this.artifacts.length > 0 ? { artifacts: this.artifacts } : {}),
            ...(this.cast.length > 0 ? { cast: this.cast } : {}),
        };
    }

    private processEvent(event: DomainEvent & { sceneId: CorrelationId }): void {
        for (const [EventType, handler] of this.eventHandlers) {
            if (event instanceof EventType) {
                handler(event as never);
                return;
            }
        }
    }

    private readonly eventHandlers: Array<[new (...args: any[]) => DomainEvent, (event: any) => void]> = [
        [SceneSequenceDetected, () => { this.isScenarioOutline = true; }],
        [RetryableSceneDetected, () => { this.isRetrySequence = true; }],
        [SceneTemplateDetected, (event: SceneTemplateDetected) => { this.template = event.template.value; }],
        [SceneParametersDetected, (event: SceneParametersDetected) => {
            this.currentParameterSet = {
                name: event.parameters.name.value,
                description: event.parameters.description.value || undefined,
                values: event.parameters.values,
            };
        }],
        [SceneStarts, (event: SceneStarts) => { this.handleSceneStarts(event); }],
        [SceneTagged, (event: SceneTagged) => { this.tags.push({ type: event.tag.type, name: event.tag.name }); }],
        [FeatureNarrativeDetected, (event: FeatureNarrativeDetected) => { this.narrative = event.description.value; }],
        [SceneDescriptionDetected, (event: SceneDescriptionDetected) => { this.description = event.description.value; }],
        [ActorEntersStage, (event: ActorEntersStage) => {
            this.cast.push({
                name: event.actor.name,
                abilities: event.actor.abilities.map(a => ({
                    name: a.class || a.type,
                    ...(a.options ? { details: JSON.stringify(a.options) } : {}),
                })),
            });
        }],
        [TaskStarts, (event: TaskStarts) => { this.handleActivityStarts(event); }],
        [InteractionStarts, (event: InteractionStarts) => { this.handleActivityStarts(event); }],
        [TaskFinished, (event: TaskFinished) => { this.handleActivityFinished(event); }],
        [InteractionFinished, (event: InteractionFinished) => { this.handleActivityFinished(event); }],
        [ActivityRelatedArtifactGenerated, (event: ActivityRelatedArtifactGenerated) => { this.handleArtifact(event); }],
        [SceneFinished, (event: SceneFinished) => { this.handleSceneFinished(event); }],
    ];

    private handleSceneStarts(event: SceneStarts): void {
        if (!this.name) {
            this.name = event.details.name.value;
            this.category = event.details.category.value;
            this.sourcePath = event.details.location.path.value;
            this.sourceLine = event.details.location.line;
            this.startedAt = event.timestamp.toISOString();
            this.sceneStartTimestamp = event.timestamp;
            this.currentAttemptStartTimestamp = event.timestamp;
        } else if (!this.isScenarioOutline && this.sceneFinishedCount > 0) {
            this.rootActivities = [];
            this.activityStack.length = 0;
            this.currentAttemptStartTimestamp = event.timestamp;
        }

        if (this.isScenarioOutline && this.currentParameterSet) {
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

        this.activityById.set(event.activityId.value, activity);
        this.activityStack.push({ record: activity, startTimestamp: event.timestamp });
    }

    private handleActivityFinished(event: TaskFinished | InteractionFinished): void {
        const entry = this.activityStack.pop();
        if (!entry) {
            return;
        }

        entry.record.outcome = serialiseOutcome(event.outcome);
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
        const activityRecord = this.activityById.get(event.activityId.value);

        if (activityRecord) {
            dispatchArtifact(activityRecord, event);
        }

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
                outcome: serialiseOutcome(event.outcome),
                duration: event.timestamp.diff(this.currentExampleStartTimestamp).inMilliseconds(),
                activities: this.rootActivities,
            });
            this.currentParameterSet = undefined;
        } else {
            const attemptError = event.outcome instanceof ProblemIndication ? errorFrom(event.outcome) : undefined;
            this.attempts.push({
                attemptNumber: this.sceneFinishedCount,
                outcome: serialiseOutcome(event.outcome),
                activities: this.rootActivities,
                duration: event.timestamp.diff(this.currentAttemptStartTimestamp).inMilliseconds(),
                ...(attemptError ? { error: attemptError } : {}),
            });
        }

        this.outcome = serialiseOutcome(event.outcome);
        this.duration = event.timestamp.diff(this.sceneStartTimestamp).inMilliseconds();

        if (event.outcome instanceof ProblemIndication) {
            this.sceneError = errorFrom(event.outcome);
        } else {
            this.sceneError = undefined;
        }
    }

}
