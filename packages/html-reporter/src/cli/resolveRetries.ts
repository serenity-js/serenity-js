import { ExecutionSuccessful } from '@serenity-js/core/model';

import { mapOutcomeToKey, outcomeCodeToDisplayString } from './model/outcomes.js';
import type { AttemptRecord, OutcomeCounts, RunData, SceneRecord } from './model/RunData.js';
import { sceneIdentity } from './model/sceneIdentity.js';

/**
 * Additively merges two RunData objects that share the same testRunId and attempt number.
 * Handles overlapping scenes (same identity including module tag) by detecting outcome differences:
 * - Different outcome → records as retry attempt
 * - Same outcome → keeps the later version (deduplication)
 *
 * Uses sceneIdentity to distinguish scenes from different modules that share the same
 * source location (e.g., webdriverio-8-web-devtools vs webdriverio-8-web-webdriverio).
 *
 * @package
 */
export function mergeAdditively(base: RunData, addition: RunData): RunData {
    const merged: RunData = { ...base };

    // Build a map of base scenes by identity (including module tag) to detect overlaps
    const baseScenesByIdentity = new Map<string, SceneRecord>();
    for (const scene of base.scenes) {
        baseScenesByIdentity.set(sceneIdentity(scene), scene);
    }

    // Merge scenes: new scenes are added, overlapping scenes are handled
    merged.scenes = [...base.scenes];
    let hasOverlap = false;
    for (const additionScene of addition.scenes) {
        const key = sceneIdentity(additionScene);
        const existingScene = baseScenesByIdentity.get(key);

        if (!existingScene) {
            // No overlap — different module, just add it
            merged.scenes.push(additionScene);
        } else if (existingScene.outcome.code !== additionScene.outcome.code) {
            // Same scene, different outcome — the earlier source captured a failure
            // that the later source shows as fixed. Record as retry attempt.
            const index = merged.scenes.indexOf(existingScene);
            merged.scenes[index] = mergeSceneWithRetry(existingScene, additionScene);
            hasOverlap = true;
        } else {
            // Same scene, same outcome — duplicate data from two input sources
            // (e.g., gh-pages pre-merged run + fresh module artifacts).
            // Keep the later version (may have more complete data) and skip the duplicate.
            const index = merged.scenes.indexOf(existingScene);
            merged.scenes[index] = additionScene;
            hasOverlap = true;
        }
    }

    // Recompute outcomes from merged scenes when overlaps were detected;
    // otherwise sum the declared outcome counts (supports modules with scenes: [])
    if (hasOverlap) {
        merged.outcomes = computeMergedOutcomes(merged.scenes);
    } else {
        merged.outcomes = {
            passed: base.outcomes.passed + addition.outcomes.passed,
            failed: base.outcomes.failed + addition.outcomes.failed,
            pending: base.outcomes.pending + addition.outcomes.pending,
            skipped: base.outcomes.skipped + addition.outcomes.skipped,
            compromised: base.outcomes.compromised + addition.outcomes.compromised,
            error: base.outcomes.error + addition.outcomes.error,
        };
    }

    if (addition.startedAt < merged.startedAt) merged.startedAt = addition.startedAt;
    if (addition.finishedAt > merged.finishedAt) merged.finishedAt = addition.finishedAt;
    merged.tags = [...base.tags];
    for (const tag of (addition.tags || [])) {
        if (!merged.tags.some(t => t.type === tag.type && t.name === tag.name)) {
            merged.tags.push(tag);
        }
    }
    return merged;
}

/**
 * Merges two RunData objects representing consecutive CI attempts of the same test run.
 * The `later` run takes precedence for scenes it contains; scenes from `earlier` that
 * genuinely failed are recorded as retry attempts on the corresponding later scene.
 *
 * Uses sceneIdentity to correctly match scenes across attempts, including
 * module discrimination.
 *
 * @package
 */
export function mergeAsRetry(earlier: RunData, later: RunData): RunData {
    const merged: RunData = { ...later };
    const earlierScenes = new Map<string, SceneRecord>();
    for (const scene of earlier.scenes) {
        earlierScenes.set(sceneIdentity(scene), scene);
    }

    merged.scenes = later.scenes.map(laterScene => {
        const key = sceneIdentity(laterScene);
        const earlierScene = earlierScenes.get(key);
        if (!earlierScene) {
            return laterScene;
        }

        // Only create retry attempts when the earlier scene actually failed.
        // If the earlier scene already passed, the CI retry didn't change anything
        // for this test — it's not a genuine retry, just a re-execution.
        const earlierFailed = earlierScene.outcome.code !== ExecutionSuccessful.Code;
        const earlierHadRetries = earlierScene.retries > 0;
        if (!earlierFailed && !earlierHadRetries) {
            return laterScene;
        }

        return mergeSceneWithRetry(earlierScene, laterScene);
    });

    // Include scenes from earlier attempt that weren't retried
    const laterSceneKeys = new Set(later.scenes.map(s => sceneIdentity(s)));
    for (const earlierScene of earlier.scenes) {
        if (!laterSceneKeys.has(sceneIdentity(earlierScene))) {
            merged.scenes.push(earlierScene);
        }
    }

    // Recompute outcomes from the final merged scenes
    merged.outcomes = computeMergedOutcomes(merged.scenes);
    if (earlier.startedAt < merged.startedAt) merged.startedAt = earlier.startedAt;

    return merged;
}

/**
 * Merges two SceneRecords into a single record with retry attempts.
 *
 * @package
 */
export function mergeSceneWithRetry(earlierScene: SceneRecord, laterScene: SceneRecord): SceneRecord {
    const existingAttempts = earlierScene.attempts || [];
    const allAttempts = [
        ...existingAttempts,
        sceneToAttempt(earlierScene, existingAttempts.length + 1),
        sceneToAttempt(laterScene, existingAttempts.length + 2),
    ];
    return {
        ...laterScene,
        attempts: allAttempts,
        retries: allAttempts.length - 1,
    } as SceneRecord;
}

/**
 * Converts a SceneRecord to an AttemptRecord for inclusion in retry history.
 *
 * @package
 */
export function sceneToAttempt(scene: SceneRecord, attemptNumber: number): AttemptRecord {
    return {
        attemptNumber,
        outcome: scene.outcome,
        duration: scene.duration,
        activities: scene.activities,
        ...(scene.error ? { error: scene.error } : {}),
        ...(scene.video ? { video: scene.video } : {}),
    };
}

/**
 * Recomputes outcome counts from an array of scene records.
 *
 * @package
 */
export function computeMergedOutcomes(scenes: SceneRecord[]): OutcomeCounts {
    const outcomes: OutcomeCounts = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
    for (const scene of scenes) {
        const key = mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code));
        outcomes[key as keyof OutcomeCounts]++;
    }
    return outcomes;
}
