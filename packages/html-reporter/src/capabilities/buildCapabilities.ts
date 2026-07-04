import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
} from '@serenity-js/core/model';
import { marked } from 'marked';

import { scoreCapability, scoreDirectory } from '../CapabilityConfidenceScorer.js';
import type { RunData, SceneRecord, TagRecord } from '../model/RunData.js';
import type { ReportCapabilityNode, ReportOutcomes } from '../ReportData.js';

const OUTCOME_CODE_DISPLAY_STRINGS: Record<number, string> = {
    [ExecutionSuccessful.Code]: 'SUCCESS',
    [ExecutionFailedWithAssertionError.Code]: 'FAILURE',
    [ExecutionFailedWithError.Code]: 'ERROR',
    [ExecutionCompromised.Code]: 'COMPROMISED',
    [ImplementationPending.Code]: 'PENDING',
    [ExecutionSkipped.Code]: 'SKIPPED',
};

function outcomeCodeToDisplayString(code: number): string {
    return OUTCOME_CODE_DISPLAY_STRINGS[code] || 'ERROR';
}

function mapOutcomeToKey(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: 'passed', FAILURE: 'failed', ERROR: 'error', COMPROMISED: 'compromised', PENDING: 'pending', SKIPPED: 'skipped' };
    return map[outcome] || 'error';
}

function sceneIdentity(scene: { source: { path: string; line: number }; name: string }): string {
    return scene.source.line
        ? `${ scene.source.path }:${ scene.source.line }`
        : `${ scene.source.path }:${ scene.name }`;
}

function sceneIdentityWithBrowser(scene: { source: { path: string; line: number }; name: string; tags: TagRecord[] }): string {
    const base = sceneIdentity(scene);
    const browserTag = scene.tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = scene.tags.find(t => t.type === 'project')?.name || '';
    const discriminator = browserTag || projectTag;
    return discriminator ? `${ base }@${ discriminator }` : base;
}

/**
 * Builds the capabilities tree from a test run and its history.
 *
 * @package
 */
export function buildCapabilities(
    run: RunData,
    allRuns: RunData[],
    requirementsHierarchy: RequirementsHierarchy,
    projectFileSystem?: FileSystem,
): ReportCapabilityNode {
    const rootName = requirementsHierarchy.rootDirectory().basename();
    const root: ReportCapabilityNode = { type: 'directory', name: rootName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
    const nodeMap = new Map<string, ReportCapabilityNode>();
    nodeMap.set('', root);

    for (const scene of run.scenes) {
        processSceneForCapabilities(scene, root, nodeMap, allRuns, requirementsHierarchy);
    }

    // Compute scores for file nodes
    for (const [, node] of nodeMap) {
        if (node.type === 'file' && node.scenarios) {
            node.score = scoreCapability(node as ReportCapabilityNode & { scenarios: NonNullable<ReportCapabilityNode['scenarios']> });
        }
    }

    // Compute scores for directory nodes (bottom-up)
    computeDirectoryScores(root);

    if (projectFileSystem) {
        const specRoot = requirementsHierarchy.rootDirectory();
        attachReadme(root, specRoot, projectFileSystem);
        for (const [key, node] of nodeMap) {
            if (key && node.type === 'directory') {
                attachReadme(node, specRoot.join(Path.from(key)), projectFileSystem);
            }
        }
    }

    return root;
}

function processSceneForCapabilities(
    scene: SceneRecord,
    root: ReportCapabilityNode,
    nodeMap: Map<string, ReportCapabilityNode>,
    allRuns: RunData[],
    requirementsHierarchy: RequirementsHierarchy,
): void {
    const segments = requirementsHierarchy.hierarchyFor(Path.from(scene.source.path));
    const fileName = segments[segments.length - 1];
    const directories = segments.slice(0, -1);

    let currentDirectory = root;
    for (let i = 0; i < directories.length; i++) {
        const directoryKey = directories.slice(0, i + 1).join('/');
        if (!nodeMap.has(directoryKey)) {
            const directory: ReportCapabilityNode = { type: 'directory', name: directories[i], outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
            currentDirectory.children.push(directory);
            nodeMap.set(directoryKey, directory);
        }
        currentDirectory = nodeMap.get(directoryKey);
    }

    const fileKey = segments.join('/');
    if (!nodeMap.has(fileKey)) {
        const file: ReportCapabilityNode = { type: 'file', name: fileName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, scenarios: [] };
        currentDirectory.children.push(file);
        nodeMap.set(fileKey, file);
    }

    const fileNode = nodeMap.get(fileKey);
    const outcomeKey = mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code)) as keyof ReportOutcomes;

    fileNode.scenarioCount++;
    fileNode.outcomes[outcomeKey]++;

    // Build execution history for this scenario across all runs
    const scenarioKey = sceneIdentityWithBrowser(scene);
    const executionHistory = allRuns.map(r => {
        const match = r.scenes.find(s => sceneIdentityWithBrowser(s) === scenarioKey);
        return match ? outcomeCodeToDisplayString(match.outcome.code) : undefined;
    }).filter(Boolean) as string[];

    fileNode.scenarios.push({ name: scene.name, outcome: outcomeCodeToDisplayString(scene.outcome.code), executionHistory });
    if (scene.narrative && !fileNode.narrative) {
        fileNode.narrative = scene.narrative;
    }

    root.scenarioCount++;
    root.outcomes[outcomeKey]++;
    for (let i = 0; i < directories.length; i++) {
        const directoryNode = nodeMap.get(directories.slice(0, i + 1).join('/'));
        if (directoryNode && directoryNode !== root) {
            directoryNode.scenarioCount++;
            directoryNode.outcomes[outcomeKey]++;
        }
    }
}

function computeDirectoryScores(node: ReportCapabilityNode): void {
    if (!node.children) return;

    for (const child of node.children) {
        if (child.type === 'directory') {
            computeDirectoryScores(child);
        }
    }

    const scoredChildren = node.children
        .filter(c => c.score)
        .map(c => ({ confidence: c.score.confidence, scenarioCount: c.scenarioCount || 0 }));

    if (scoredChildren.length > 0) {
        const confidence = scoreDirectory(scoredChildren);
        node.score = { confidence, passRate: 0, completeness: 0, consistency: 0 };

        // Also compute pass rate/completeness/consistency for the directory directly
        const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0) as number;
        const pending = ((node.outcomes.pending || 0) + (node.outcomes.skipped || 0)) as number;
        const executed = total - pending;
        node.score.passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
        node.score.completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
        node.score.consistency = 100; // Would need aggregated history; use child-weighted confidence instead
    }
}

function attachReadme(node: ReportCapabilityNode, directoryPath: Path, projectFileSystem: FileSystem): void {
    const readmePath = directoryPath.join(Path.from('readme.md'));
    if (projectFileSystem.exists(readmePath)) {
        const content = projectFileSystem.readFileSync(readmePath, { encoding: 'utf8' }) as string;

        // Extract first heading as displayName
        const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
        if (headingMatch) {
            node.displayName = headingMatch[1].trim();
        }

        // Render markdown and strip the first heading to avoid duplication
        let html = marked.parse(content, { async: false }) as string;
        if (node.displayName) {
            html = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
        }
        node.readme = html;
    }
}
