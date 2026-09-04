import { effectiveOutcome } from './outcomes.js';
import { resolveRunLabel } from './resolveRunLabel.js';
import type { RunData } from './RunData.js';
import { findHistoricalMatch } from './sceneIdentity.js';

/**
 * A group of outcomes for a single test identity across multiple runs.
 * The `representative` is the first scene encountered for this identity
 * and carries the canonical `name`, `source`, `tags`, etc.
 *
 * @internal
 */
export interface SceneOutcomeGroup {
    representative: RunData['scenes'][number];
    outcomes: string[];
    labels: string[];
}

/**
 * Groups scenes across runs by fuzzy-matching identity (2-of-3 on path, line, name).
 * Each unique test identity produces one group with accumulated outcomes and run labels.
 *
 * @internal
 */
export function groupOutcomesByScene(runs: RunData[]): SceneOutcomeGroup[] {
    const groups: SceneOutcomeGroup[] = [];
    const representatives: RunData['scenes'][number][] = [];

    for (const run of runs) {
        const runLabel = resolveRunLabel(run);
        for (const scene of run.scenes) {
            const match = findHistoricalMatch(scene, representatives);
            const outcome = effectiveOutcome(scene);

            if (match) {
                const groupIndex = representatives.indexOf(match);
                groups[groupIndex].outcomes.push(outcome);
                groups[groupIndex].labels.push(runLabel);
            } else {
                representatives.push(scene);
                groups.push({
                    representative: scene,
                    outcomes: [outcome],
                    labels: [runLabel],
                });
            }
        }
    }

    return groups;
}
