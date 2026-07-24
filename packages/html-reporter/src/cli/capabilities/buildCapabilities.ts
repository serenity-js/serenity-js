import { posix } from 'node:path';

import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import { Marked, parseInline } from 'marked';

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

    computeFileScores(nodeMap);
    computeDirectoryScores(root);

    if (projectFileSystem) {
        attachReadmes(root, nodeMap, requirementsHierarchy, projectFileSystem);
    }

    return root;
}

function computeFileScores(nodeMap: Map<string, ReportCapabilityNode>): void {
    for (const [, node] of nodeMap) {
        if (node.type === 'file' && node.scenarios) {
            node.score = scoreCapability(node as ReportCapabilityNode & { scenarios: NonNullable<ReportCapabilityNode['scenarios']> });
        }
    }
}

function attachReadmes(
    root: ReportCapabilityNode,
    nodeMap: Map<string, ReportCapabilityNode>,
    requirementsHierarchy: RequirementsHierarchy,
    projectFileSystem: FileSystem,
): void {
    const specRoot = requirementsHierarchy.rootDirectory();
    attachReadme(root, specRoot, projectFileSystem, '', nodeMap);
    for (const [key, node] of nodeMap) {
        if (key && node.type === 'directory') {
            attachReadme(node, specRoot.join(Path.from(key)), projectFileSystem, key, nodeMap);
        }
    }
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

    const currentDirectory = ensureDirectoryChain(directories, root, nodeMap);
    const fileNode = ensureFileNode(segments, fileName, currentDirectory, nodeMap);

    const outcomeKey = mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code)) as keyof ReportOutcomes;

    fileNode.scenarioCount++;
    fileNode.outcomes[outcomeKey]++;

    const executionHistory = buildExecutionHistory(scene, allRuns);

    fileNode.scenarios.push({ name: scene.name, outcome: outcomeCodeToDisplayString(scene.outcome.code), executionHistory });
    if (scene.narrative && !fileNode.narrative) {
        fileNode.narrative = scene.narrative;
    }

    propagateOutcomes(root, directories, nodeMap, outcomeKey);
}

function ensureDirectoryChain(
    directories: string[],
    root: ReportCapabilityNode,
    nodeMap: Map<string, ReportCapabilityNode>,
): ReportCapabilityNode {
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
    return currentDirectory;
}

function ensureFileNode(
    segments: string[],
    fileName: string,
    currentDirectory: ReportCapabilityNode,
    nodeMap: Map<string, ReportCapabilityNode>,
): ReportCapabilityNode {
    const fileKey = segments.join('/');
    if (!nodeMap.has(fileKey)) {
        const file: ReportCapabilityNode = { type: 'file', name: fileName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, scenarios: [] };
        currentDirectory.children.push(file);
        nodeMap.set(fileKey, file);
    }
    return nodeMap.get(fileKey);
}

function buildExecutionHistory(scene: SceneRecord, allRuns: RunData[]): string[] {
    const scenarioKey = sceneIdentityWithTags(scene);
    return allRuns.map(r => {
        const match = r.scenes.find(s => sceneIdentityWithTags(s) === scenarioKey);
        return match ? outcomeCodeToDisplayString(match.outcome.code) : undefined;
    }).filter(Boolean) as string[];
}

function propagateOutcomes(
    root: ReportCapabilityNode,
    directories: string[],
    nodeMap: Map<string, ReportCapabilityNode>,
    outcomeKey: keyof ReportOutcomes,
): void {
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

        const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0) as number;
        const pending = ((node.outcomes.pending || 0) + (node.outcomes.skipped || 0)) as number;
        const executed = total - pending;
        node.score.passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
        node.score.completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
        node.score.consistency = 100;
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

    const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
    if (headingMatch) {
        node.displayName = headingMatch[1].trim();
    }

    node.readme = renderReadmeHtml(content, currentNodePath, nodeMap, node.displayName);
}

/**
 * Renders markdown content as HTML with custom link transformation.
 *
 * Uses the standalone `parseInline` function from `marked` to render link
 * text tokens, rather than `this.parser.parseInline(tokens)`. The `this`
 * binding inside renderer methods is unreliable — on Linux CI (different
 * Node/Babel compilation), `this.parser` can be undefined when marked
 * invokes the renderer function without preserving the call context.
 * Using the standalone function eliminates the binding dependency entirely.
 *
 * @package
 */
export function renderReadmeHtml(
    content: string,
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
    displayName: string | undefined,
): string {
    const linkRenderer = buildLinkRenderer(currentNodePath, nodeMap);

    const instance = new Marked({
        renderer: {
            link: linkRenderer,
        },
    });

    let html = instance.parse(content, { async: false }) as string;
    if (displayName) {
        html = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
    }
    return html;
}

function buildLinkRenderer(
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
): (token: { href: string; title?: string | null; tokens: Array<{ raw: string }> }) => string {
    return ({ href, title, tokens }) => {
        const text = parseInline(tokens.map(t => t.raw).join('')) as string;
        const titleAttribute = title ? ` title="${title}"` : '';

        const resolved = resolveLocalHref(href, currentNodePath);

        if (resolved === undefined) {
            return buildExternalLink(href, titleAttribute, text);
        }

        return buildInternalLink(resolved, href, titleAttribute, text, nodeMap);
    };
}

function resolveLocalHref(href: string, currentNodePath: string): string | undefined {
    if (!href.startsWith('./') && !href.startsWith('../')) {
        return undefined;
    }

    const basePath = currentNodePath || '.';
    let resolved = posix.normalize(posix.join(basePath, href));

    if (resolved.startsWith('..')) {
        return undefined;
    }

    if (resolved === '.') {
        resolved = '';
    } else if (resolved.startsWith('./')) {
        resolved = resolved.substring(2);
    }

    if (/\/readme\.md$/i.test(resolved)) {
        resolved = resolved.replace(/\/readme\.md$/i, '');
    } else if (/^readme\.md$/i.test(resolved)) {
        resolved = '';
    }

    return resolved;
}

function buildExternalLink(href: string, titleAttribute: string, text: string): string {
    const targetAttribute = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${titleAttribute}${targetAttribute}>${text}</a>`;
}

function buildInternalLink(
    resolved: string,
    href: string,
    titleAttribute: string,
    text: string,
    nodeMap: Map<string, ReportCapabilityNode>,
): string {
    const withoutTrailingSlash = resolved.replace(/\/$/, '');
    const isDirectoryLink = href.endsWith('/') || /\/readme\.md$/i.test(href) || /^\.\/readme\.md$/i.test(href) || nodeMap.has(withoutTrailingSlash);

    if (isDirectoryLink && nodeMap.has(withoutTrailingSlash)) {
        const capabilitiesHref = withoutTrailingSlash === ''
            ? '#/capabilities'
            : `#/capabilities?path=${encodeURIComponent(withoutTrailingSlash)}`;
        return `<a href="${capabilitiesHref}"${titleAttribute}>${text}</a>`;
    }

    if (isDirectoryLink) {
        return `<a href="${href}"${titleAttribute}>${text}</a>`;
    }

    if (/\.(spec|test)\.(ts|js|mjs|cjs)$/.test(resolved)) {
        const encodedSearch = encodeURIComponent('"' + withoutTrailingSlash + '"');
        return `<a href="#/tests?search=${encodedSearch}"${titleAttribute}>${text}</a>`;
    }

    return `<a href="${href}"${titleAttribute}>${text}</a>`;
}
