import type { DomainEventQueues } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import type { Path } from '@serenity-js/core/io';
import type { CorrelationId } from '@serenity-js/core/model';

import type { OutcomeCounts, RunData, SceneRecord, TagRecord } from './model/RunData.js';
import { CURRENT_RUN_DATA_SCHEMA_VERSION } from './model/RunData.js';
import { buildSceneRecords, groupEventsBySceneId, resolveRetries } from './retryResolution.js';
import { outcomeCodeToLabel, SceneRecordBuilder } from './SceneRecordBuilder.js';
import type { SystemContext } from './SystemContextDetector.js';

export interface CollectOptions {
    queues: DomainEventQueues;
    testRunStartedAt: string;
    testRunnerName: string;
    testRunnerVersion: string;
    artifactPaths: Map<string, Path[]>;
    systemContext: SystemContext;
    sceneArtifactPaths?: Map<string, Path[]>;
    moduleId?: string;
}

/**
 * Transforms DomainEventQueues into the RunData model.
 *
 * @package
 */
export class SceneDataCollector {

    collect(options: CollectOptions): RunData {
        const { queues, testRunStartedAt, testRunnerName, testRunnerVersion, artifactPaths, systemContext, sceneArtifactPaths, moduleId } = options;
        const scenes: SceneRecord[] = [];

        queues.forEach(queue => {
            const events = queue.drain();
            const queueScenes = this.processQueue(events, artifactPaths, sceneArtifactPaths);
            scenes.push(...queueScenes);
        });

        // Attach module tag to all scenes when moduleId is provided
        if (moduleId) {
            for (const scene of scenes) {
                scene.tags.push({ type: 'module', name: moduleId });
            }
        }

        return this.assembleRunData(scenes, testRunStartedAt, testRunnerName, testRunnerVersion, systemContext);
    }

    private processQueue(
        events: Array<DomainEvent & { sceneId: CorrelationId }>,
        artifactPaths: Map<string, Path[]>,
        sceneArtifactPaths?: Map<string, Path[]>,
    ): SceneRecord[] {
        const eventsBySceneId = groupEventsBySceneId(events);
        const records = buildSceneRecords(eventsBySceneId, sceneEvents =>
            new SceneRecordBuilder(artifactPaths).build(sceneEvents),
        );

        return resolveRetries(records, events, sceneArtifactPaths);
    }

    private assembleRunData(
        scenes: SceneRecord[],
        testRunStartedAt: string,
        testRunnerName: string,
        testRunnerVersion: string,
        systemContext: SystemContext,
    ): RunData {
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
            schemaVersion: CURRENT_RUN_DATA_SCHEMA_VERSION,
            startedAt,
            finishedAt,
            outcomes: this.summariseOutcomes(scenes),
            scenes,
            tags: this.collectUniqueTags(scenes),
            testRunner: { name: testRunnerName, version: testRunnerVersion },
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
