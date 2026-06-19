import type { DomainEventQueues, Timestamp } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    ActivityRelatedArtifactGenerated,
    FeatureNarrativeDetected,
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
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

import type { ActivityRecord, ArtifactReference, ErrorRecord, OutcomeCounts, RunData, SceneRecord, TagRecord } from './model/RunData.js';
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
    ): RunData {
        const scenes: SceneRecord[] = [];

        queues.forEach(queue => {
            const events = queue.drain();
            scenes.push(new SceneRecordBuilder(artifactPaths).build(events));
        });

        return {
            timestamp: testRunStartedAt,
            duration: scenes.reduce((total, scene) => total + scene.duration, 0),
            outcomes: this.summariseOutcomes(scenes),
            scenes,
            tags: this.collectUniqueTags(scenes),
            testRunner: testRunnerName,
            testRunnerVersion,
            systemContext,
        };
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
    private readonly tags: TagRecord[] = [];
    private readonly activityStack: Array<{ record: ActivityRecord; startTimestamp: Timestamp }> = [];
    private readonly rootActivities: ActivityRecord[] = [];
    private readonly artifacts: ArtifactReference[] = [];

    constructor(private readonly artifactPaths: Map<string, Path[]>) {
    }

    build(events: Array<DomainEvent & { sceneId: CorrelationId }>): SceneRecord {
        for (const event of events) {
            this.processEvent(event);
        }

        if (!this.name) {
            throw new LogicError('SceneRecordBuilder received an event queue without a SceneStarts event');
        }

        const record: SceneRecord = {
            name: this.name,
            category: this.category,
            outcome: this.outcome,
            duration: this.duration,
            startedAt: this.startedAt,
            source: { path: this.sourcePath, line: this.sourceLine },
            tags: this.tags,
            activities: this.rootActivities,
        };

        if (this.narrative) {
            record.narrative = this.narrative;
        }

        if (this.artifacts.length > 0) {
            record.artifacts = this.artifacts;
        }

        return record;
    }

    private processEvent(event: DomainEvent & { sceneId: CorrelationId }): void {
        if (event instanceof SceneStarts) {
            this.handleSceneStarts(event);
        } else if (event instanceof SceneTagged) {
            this.tags.push({ type: event.tag.type, name: event.tag.name });
        } else if (event instanceof FeatureNarrativeDetected) {
            this.narrative = event.description.value;
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
        this.name = event.details.name.value;
        this.category = event.details.category.value;
        this.sourcePath = event.details.location.path.value;
        this.sourceLine = event.details.location.line;
        this.startedAt = event.timestamp.toISOString();
        this.sceneStartTimestamp = event.timestamp;
    }

    private handleActivityStarts(event: TaskStarts | InteractionStarts): void {
        const activity: ActivityRecord = {
            type: event instanceof TaskStarts ? 'Task' : 'Interaction',
            name: event.details.name.value,
            outcome: { code: ImplementationPending.Code },
            duration: 0,
            children: [],
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
        this.outcome = event.outcome.toJSON();
        this.duration = event.timestamp.diff(this.sceneStartTimestamp).inMilliseconds();
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
