import { posix } from 'node:path';

import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import { Marked } from 'marked';

import { scoreCapability, scoreDirectory } from '../CapabilityConfidenceScorer.js';
import { mapOutcomeToKey, outcomeCodeToDisplayString } from '../model/outcomes.js';
import type { RunData, SceneRecord } from '../model/RunData.js';
import { sceneIdentityWithTags } from '../model/sceneIdentity.js';
import type { ReportCapabilityNode, ReportOutcomes } from '../ReportData.js';

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
        attachReadme(root, specRoot, projectFileSystem, '', nodeMap);
        for (const [key, node] of nodeMap) {
            if (key && node.type === 'directory') {
                attachReadme(node, specRoot.join(Path.from(key)), projectFileSystem, key, nodeMap);
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
    const scenarioKey = sceneIdentityWithTags(scene);
    const executionHistory = allRuns.map(r => {
        const match = r.scenes.find(s => sceneIdentityWithTags(s) === scenarioKey);
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

function findReadme(directoryPath: Path, projectFileSystem: FileSystem): Path | undefined {
    try {
        const entries = projectFileSystem.readdirSync(directoryPath);
        const readmeEntry = entries.find(entry => /^readme\.md$/i.test(entry));
        if (readmeEntry) {
            return directoryPath.join(Path.from(readmeEntry));
        }
    } catch {
        // Directory doesn't exist or isn't readable
    }
    return undefined;
}

function attachReadme(
    node: ReportCapabilityNode,
    directoryPath: Path,
    projectFileSystem: FileSystem,
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
): void {
    const readmePath = findReadme(directoryPath, projectFileSystem);
    if (!readmePath || !projectFileSystem.exists(readmePath)) return;

    const content = projectFileSystem.readFileSync(readmePath, { encoding: 'utf8' }) as string;

    // Extract first heading as displayName
    const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
    if (headingMatch) {
        node.displayName = headingMatch[1].trim();
    }

    node.readme = renderReadmeHtml(content, currentNodePath, nodeMap, node.displayName);
}

/**
 * Renders markdown content as HTML with custom link transformation.
 *
 * Uses `new Marked({ renderer: { link(...) } })` rather than direct property
 * assignment on a Renderer instance. The `Marked.use()` pattern internally
 * calls the renderer function via `.apply(renderer, args)`, which guarantees
 * correct `this` binding regardless of how the host environment compiles or
 * invokes the function. Direct assignment (`renderer.link = function(...)`)
 * relies on implicit method-call `this` binding, which can be lost on Linux
 * CI when Playwright's Babel transform processes the function expression.
 *
 * @package
 */
export function renderReadmeHtml(
    content: string,
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
    displayName: string | undefined,
): string {
    const instance = new Marked({
        renderer: {
            link({ href, title, tokens }) {
                const text = this.parser.parseInline(tokens);
                const titleAttribute = title ? ` title="${title}"` : '';

                // Rule 1: Not local — don't transform
                if (!href.startsWith('./') && !href.startsWith('../')) {
                    const targetAttribute = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
                    return `<a href="${href}"${titleAttribute}${targetAttribute}>${text}</a>`;
                }

                // Resolve relative to current node path within spec directory
                const basePath = currentNodePath || '.';
                let resolved = posix.normalize(posix.join(basePath, href));

                // Rule 3: Escapes specDirectory (goes above root)
                if (resolved.startsWith('..')) {
                    return `<a href="${href}"${titleAttribute}>${text}</a>`;
                }

                // Clean up leading "./" if present after normalize
                if (resolved === '.') {
                    resolved = '';
                } else if (resolved.startsWith('./')) {
                    resolved = resolved.substring(2);
                }

                // Rule 4: Ends with /readme.md (case-insensitive) — strip and treat as directory
                if (/\/readme\.md$/i.test(resolved)) {
                    resolved = resolved.replace(/\/readme\.md$/i, '');
                } else if (/^readme\.md$/i.test(resolved)) {
                    resolved = '';
                }

                // Rule 5: Directory link (ends with / or original href points to readme.md or node exists)
                const withoutTrailingSlash = resolved.replace(/\/$/, '');
                if (href.endsWith('/') || /\/readme\.md$/i.test(href) || /^\.\/readme\.md$/i.test(href) || nodeMap.has(withoutTrailingSlash)) {
                    if (nodeMap.has(withoutTrailingSlash)) {
                        if (withoutTrailingSlash === '') {
                            return `<a href="#/capabilities"${titleAttribute}>${text}</a>`;
                        }
                        const encodedPath = encodeURIComponent(withoutTrailingSlash);
                        return `<a href="#/capabilities?path=${encodedPath}"${titleAttribute}>${text}</a>`;
                    }
                    // Directory link but not in nodeMap — don't transform
                    return `<a href="${href}"${titleAttribute}>${text}</a>`;
                }

                // Rule 6: Spec file link
                if (/\.(spec|test)\.(ts|js|mjs|cjs)$/.test(resolved)) {
                    const encodedSearch = encodeURIComponent('"' + withoutTrailingSlash + '"');
                    return `<a href="#/tests?search=${encodedSearch}"${titleAttribute}>${text}</a>`;
                }

                // Rule 7: Any other case — don't transform
                return `<a href="${href}"${titleAttribute}>${text}</a>`;
            },
        },
    });

    let html = instance.parse(content, { async: false }) as string;
    if (displayName) {
        html = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
    }
    return html;
}
