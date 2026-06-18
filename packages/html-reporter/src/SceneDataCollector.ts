import type { DomainEventQueues } from '@serenity-js/core';
import type { Timestamp } from '@serenity-js/core';
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
import type { CorrelationId, Outcome } from '@serenity-js/core/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    ProblemIndication,
} from '@serenity-js/core/model';

import type { ActivityRecord, ArtifactReference, ErrorRecord, OutcomeCounts, RunData, SceneRecord, TagRecord } from './model/RunData.js';

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
    ): RunData {
        const scenes: SceneRecord[] = [];

        queues.forEach(queue => {
            const events = queue.drain();
            const scene = this.processEvents(events, artifactPaths);
            if (scene) {
                scenes.push(scene);
            }
        });

        const duration = this.totalDuration(scenes);
        const outcomes = this.summariseOutcomes(scenes);

        return {
            timestamp: testRunStartedAt,
            duration,
            outcomes,
            scenes,
            tags: this.collectUniqueTags(scenes),
            testRunner: testRunnerName,
            testRunnerVersion,
        };
    }

    private processEvents(events: Array<DomainEvent & { sceneId: CorrelationId }>, artifactPaths: Map<string, Path[]>): SceneRecord | undefined {
        let name: string;
        let category: string;
        let sourcePath: string;
        let sourceLine: number;
        let startedAt: string;
        let sceneStartTimestamp: Timestamp;
        let outcome: string;
        let duration = 0;
        let narrative: string | undefined;
        const tags: TagRecord[] = [];
        const activityStack: Array<{ record: ActivityRecord; startTimestamp: Timestamp }> = [];
        const rootActivities: ActivityRecord[] = [];
        const artifacts: ArtifactReference[] = [];

        for (const event of events) {
            if (event instanceof SceneStarts) {
                name = event.details.name.value;
                category = event.details.category.value;
                sourcePath = event.details.location.path.value;
                sourceLine = event.details.location.line;
                startedAt = event.timestamp.toISOString();
                sceneStartTimestamp = event.timestamp;
            }

            if (event instanceof SceneTagged) {
                tags.push({
                    type: event.tag.type,
                    name: event.tag.name,
                });
            }

            if (event instanceof FeatureNarrativeDetected) {
                narrative = event.description.value;
            }

            if (event instanceof TaskStarts || event instanceof InteractionStarts) {
                const activity: ActivityRecord = {
                    type: event instanceof TaskStarts ? 'Task' : 'Interaction',
                    name: event.details.name.value,
                    outcome: 'PENDING',
                    duration: 0,
                    children: [],
                };

                if (activityStack.length > 0) {
                    activityStack[activityStack.length - 1].record.children.push(activity);
                } else {
                    rootActivities.push(activity);
                }

                activityStack.push({ record: activity, startTimestamp: event.timestamp });
            }

            if (event instanceof TaskFinished || event instanceof InteractionFinished) {
                const entry = activityStack.pop();
                if (entry) {
                    entry.record.outcome = this.outcomeToString(event.outcome);
                    entry.record.duration = event.timestamp.diff(entry.startTimestamp).inMilliseconds();

                    if (event.outcome instanceof ProblemIndication) {
                        entry.record.error = this.errorFrom(event.outcome);
                    }

                    // Associate artifacts with this activity
                    const activityArtifacts = artifactPaths.get(event.activityId.value);
                    if (activityArtifacts) {
                        entry.record.artifacts = activityArtifacts.map(p => ({
                            path: p.value,
                            type: 'screenshot',
                        }));
                    }
                }
            }

            if (event instanceof ActivityRelatedArtifactGenerated) {
                const activityArtifactPaths = artifactPaths.get(event.activityId.value);
                if (activityArtifactPaths) {
                    for (const p of activityArtifactPaths) {
                        if (!artifacts.some(a => a.path === p.value)) {
                            artifacts.push({ path: p.value, type: 'screenshot', activityId: event.activityId.value });
                        }
                    }
                }
            }

            if (event instanceof SceneFinished) {
                outcome = this.outcomeToString(event.outcome);
                duration = event.timestamp.diff(sceneStartTimestamp).inMilliseconds();
            }
        }

        if (!name) {
            return undefined;
        }

        const sceneRecord: SceneRecord = {
            name,
            category,
            outcome,
            duration,
            startedAt,
            source: { path: sourcePath, line: sourceLine },
            tags,
            activities: rootActivities,
        };

        if (narrative) {
            sceneRecord.narrative = narrative;
        }

        if (artifacts.length > 0) {
            sceneRecord.artifacts = artifacts;
        }

        return sceneRecord;
    }

    private outcomeToString(outcome: Outcome): string {
        if (outcome instanceof ExecutionSuccessful) return 'SUCCESS';
        if (outcome instanceof ExecutionFailedWithAssertionError) return 'FAILURE';
        if (outcome instanceof ExecutionFailedWithError) return 'ERROR';
        if (outcome instanceof ExecutionCompromised) return 'COMPROMISED';
        if (outcome instanceof ImplementationPending) return 'PENDING';
        if (outcome instanceof ExecutionSkipped) return 'SKIPPED';
        return 'ERROR';
    }

    private errorFrom(outcome: ProblemIndication): ErrorRecord {
        return {
            name: outcome.error.name,
            message: outcome.error.message,
            stack: outcome.error.stack || '',
        };
    }

    private totalDuration(scenes: SceneRecord[]): number {
        return scenes.reduce((total, scene) => total + scene.duration, 0);
    }

    private summariseOutcomes(scenes: SceneRecord[]): OutcomeCounts {
        const counts: OutcomeCounts = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
        for (const scene of scenes) {
            switch (scene.outcome) {
                case 'SUCCESS': counts.passed++; break;
                case 'FAILURE': counts.failed++; break;
                case 'PENDING': counts.pending++; break;
                case 'SKIPPED': counts.skipped++; break;
                case 'COMPROMISED': counts.compromised++; break;
                case 'ERROR': counts.error++; break;
            }
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
