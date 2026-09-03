import type { TagRecord } from './RunData.js';

/**
 * Computes a discriminator string from the module, browser, project, and platform tags.
 * Returns an empty string if no discriminator tags are present.
 *
 * Module is included because different CI jobs (e.g., webdriverio-8-web-devtools vs
 * webdriverio-8-web-webdriverio) can run the same test file with different configurations.
 * Without module discrimination, tests from different modules with the same source location
 * would be incorrectly merged as duplicates.
 *
 * @internal
 */
export function tagDiscriminator(tags: TagRecord[]): string {
    const moduleTag = tags.find(t => t.type === 'module')?.name || '';
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [moduleTag, browserTag, projectTag, platformTag].filter(Boolean).join('@');
}

/**
 * Computes a unique identity for a scene from its source location and tags.
 * Used to identify and match the same scenario across different runs and modules.
 *
 * The identity includes:
 * - Source path and line number (or name if line is missing)
 * - Module tag (distinguishes same test in different CI jobs)
 * - Browser, project, and platform tags (distinguishes multi-variant scenarios)
 *
 * @internal
 */
export function sceneIdentity(scene: { source: { path: string; line: number }; name: string; tags: TagRecord[] }): string {
    const base = scene.source.line
        ? `${ scene.source.path }:${ scene.source.line }`
        : `${ scene.source.path }:${ scene.name }`;
    const discriminator = tagDiscriminator(scene.tags);
    return discriminator ? `${ base }@${ discriminator }` : base;
}

type SceneShape = { source: { path: string; line: number }; name: string; tags: TagRecord[] };

/**
 * Creates a collision-aware identity function for scenes within a single run.
 *
 * When multiple scenes share the same `path:line` (and the same tag discriminator),
 * such as tests generated dynamically via a `for` loop, the standard `sceneIdentity`
 * produces identical keys for distinct tests. This function detects those collisions
 * and appends the scenario name to disambiguate.
 *
 * Non-colliding scenes retain their original `path:line` identity, preserving
 * backwards-compatible history matching for renamed tests.
 *
 * @param scenes - All scenes in the run
 * @returns A function that produces a unique identity for each scene
 *
 * @internal
 */
export function sceneIdentityWithinRun(scenes: SceneShape[]): (scene: SceneShape) => string {
    const baseIdentityCounts = new Map<string, number>();
    for (const scene of scenes) {
        const base = sceneIdentity(scene);
        baseIdentityCounts.set(base, (baseIdentityCounts.get(base) || 0) + 1);
    }

    return (scene: SceneShape): string => {
        const base = sceneIdentity(scene);
        if (baseIdentityCounts.get(base) > 1 && scene.source.line) {
            const discriminator = tagDiscriminator(scene.tags);
            const nameQualified = `${ scene.source.path }:${ scene.source.line }:${ scene.name }`;
            return discriminator ? `${ nameQualified }@${ discriminator }` : nameQualified;
        }
        return base;
    };
}

/**
 * Computes a match score and tiebreaker for two scenes.
 * Score counts matching fields (0–3); tiebreaker encodes which fields matched
 * so that path+name (6) > path+line (5) > line+name (3).
 */
function matchScore(
    a: SceneShape,
    b: SceneShape,
): { score: number; tiebreaker: number } {
    const pathMatch = a.source.path === b.source.path;
    const lineMatch = a.source.line === b.source.line;
    const nameMatch = a.name === b.name;

    return {
        score: +pathMatch + +lineMatch + +nameMatch,
        tiebreaker: (pathMatch ? 4 : 0) + (nameMatch ? 2 : 0) + (lineMatch ? 1 : 0),
    };
}

/**
 * Finds the best-matching candidate for a scene using 2-of-3 fuzzy matching
 * on path, line, and name. Used for cross-run history matching where a test
 * may have been renamed (path+line still match) or moved within a file
 * (path+name still match).
 *
 * The tag discriminator (module, browser, project, platform) is a hard gate:
 * candidates with a different discriminator are excluded before scoring.
 *
 * When multiple candidates score equally, tiebreaking prefers:
 *   3/3 > path+name (6) > path+line (5) > line+name (3)
 *
 * @param scene      - The scene to find a historical match for
 * @param candidates - All scenes from a historical run
 * @returns The best-matching candidate, or `undefined` if no candidate scores ≥ 2
 *
 * @internal
 */
export function findHistoricalMatch<T extends SceneShape>(
    scene: SceneShape,
    candidates: T[],
): T | undefined {
    const sceneDiscriminator = tagDiscriminator(scene.tags);

    let bestMatch: T | undefined;
    let bestScore = 0;
    let bestTiebreaker = 0;

    for (const candidate of candidates) {
        if (tagDiscriminator(candidate.tags) !== sceneDiscriminator) {
            continue;
        }

        const { score, tiebreaker } = matchScore(scene, candidate);

        if (score >= 2 && (score > bestScore || (score === bestScore && tiebreaker > bestTiebreaker))) {
            bestScore = score;
            bestTiebreaker = tiebreaker;
            bestMatch = candidate;
        }
    }

    return bestMatch;
}
