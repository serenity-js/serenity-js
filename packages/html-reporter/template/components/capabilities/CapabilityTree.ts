import htm from 'htm';
import { h } from 'preact';

import type { ReportCapabilityNode } from '../../../src/ReportData';
import { SegmentedBar } from '../charts/SegmentedBar';

const html = htm.bind(h);

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;

export function confidenceColor(score: number): string {
    if (score >= 90) return 'var(--color-passed)';
    if (score < 50) return 'var(--color-failed)';
    if (score < 70) return 'var(--color-pending)';
    return 'inherit';
}

export function computeNodeScore(node: ReportCapabilityNode): { confidence: number; passRate: number; completeness: number; consistency: number } {
    if (node.score) return node.score;
    const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return { confidence: 0, passRate: 0, completeness: 0, consistency: 100 };
    const pending = (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
    if (pending === total) return { confidence: 0, passRate: 0, completeness: 0, consistency: 100 };
    const executed = total - pending;
    const passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
    const completeness = Math.round(((total - pending) / total) * 100);
    const consistency = 100;
    const confidence = Math.round(passRate * 0.40 + completeness * 0.25 + consistency * 0.35);
    return { confidence, passRate, completeness, consistency };
}

export function nodeConfidence(node: ReportCapabilityNode): number {
    return computeNodeScore(node).confidence;
}

export function nodeHasGap(node: ReportCapabilityNode): boolean {
    if (node.type === 'file') {
        const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0);
        return total === 0 || (node.outcomes.pending || 0) + (node.outcomes.skipped || 0) > 0;
    }
    if (node.children) return node.children.some(nodeHasGap);
    return false;
}

export function nodeHasFiles(node: ReportCapabilityNode): boolean {
    return !!(node.children && node.children.some(c => c.type === 'file'));
}

export function nodeMatches(node: ReportCapabilityNode, term: string): boolean {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => nodeMatches(c, term));
    return false;
}

export function findNodeByPath(root: ReportCapabilityNode, targetPath: string): ReportCapabilityNode | null {
    if (!targetPath) return root;
    if (!root.children) return null;
    const parts = targetPath.split('/');
    let current: ReportCapabilityNode = root;
    for (const part of parts) {
        if (!current.children) return null;
        const found = current.children.find(c => c.name === part);
        if (!found) return null;
        current = found;
    }
    return current;
}

export function countTopLevelCapabilities(capabilities: ReportCapabilityNode): number {
    if (!capabilities || !capabilities.children) return 0;
    return capabilities.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0).length;
}

export function countVisibleNodes(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): number {
    let count = 0;
    function walk(node: ReportCapabilityNode) {
        if (!node.children) return;
        for (const child of node.children) {
            if (child.type !== 'directory' || !child.children || child.children.length === 0) continue;
            if (nodeFilter && !nodeFilter(child)) continue;
            if (searchTerm && !nodeMatches(child, searchTerm)) continue;
            count++;
            walk(child);
        }
    }
    walk(root);
    return count;
}

export function getVisiblePaths(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): string[] {
    const paths: string[] = [];

    function walk(node: ReportCapabilityNode, parentPath: string, isRoot: boolean) {
        const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
        if (!isDirectory) return;

        const segmentPath = isRoot ? '' : (parentPath ? parentPath + '/' + node.name : node.name);

        if (!isRoot && nodeFilter && !nodeFilter(node)) return;

        // Apply single-child collapse logic
        let displayNode = node;
        let collapsedPath = segmentPath;
        let collapsedLabel = node.displayName || node.name;
        if (!isRoot && !node.readme && !nodeHasFiles(node)) {
            while (displayNode.children) {
                const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
                const files = displayNode.children.filter(c => c.type === 'file');
                if (directories.length === 1 && files.length === 0) {
                    const only = directories[0];
                    if (only.readme) break;
                    collapsedPath = collapsedPath ? collapsedPath + '/' + only.name : only.name;
                    collapsedLabel += '/' + (only.displayName || only.name);
                    displayNode = only;
                } else {
                    break;
                }
            }
        }

        // Check search filtering
        const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const childrenMatch = displayNode.children ? displayNode.children.some(c => nodeMatches(c, searchTerm)) : false;
        if (searchTerm && !matchesSearch && !childrenMatch) return;

        paths.push(collapsedPath);

        if (displayNode.children) {
            for (const child of displayNode.children) {
                walk(child, collapsedPath, false);
            }
        }
    }

    walk(root, '', true);
    return paths;
}

function sortChildren(children: ReportCapabilityNode[] | undefined, sortMode: string): ReportCapabilityNode[] {
    if (!children) return [];
    const sorted = [...children];
    switch (sortMode) {
        case 'confidence':
            sorted.sort((a, b) => nodeConfidence(a) - nodeConfidence(b));
            break;
        case 'scenarios':
            sorted.sort((a, b) => {
                const totalB = Object.values(b.outcomes).reduce((s: number, v: number) => s + v, 0);
                const totalA = Object.values(a.outcomes).reduce((s: number, v: number) => s + v, 0);
                return totalB - totalA;
            });
            break;
        default: // 'name'
            sorted.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
            break;
    }
    return sorted;
}

export interface TreeNodeProps {
    node: ReportCapabilityNode;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
    selectedPath: string;
    focusedPath: string;
    depth: number;
    path: string;
    searchTerm: string;
    isRoot?: boolean;
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null;
    sortMode: string;
}

export function TreeNode({ node, onSelect, selectedPath, focusedPath, depth, path, searchTerm, isRoot, nodeFilter, sortMode }: TreeNodeProps): ReturnType<typeof html> | null {
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);

    if (!isDirectory) return null;
    if (!isRoot && nodeFilter && !nodeFilter(node)) return null;

    // GitHub-style single-child collapse
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!isRoot && !node.readme && !nodeHasFiles(node)) {
        while (displayNode.children) {
            const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
            const files = displayNode.children.filter(c => c.type === 'file');
            if (directories.length === 1 && files.length === 0) {
                const only = directories[0];
                if (only.readme) break;  // Stop before a node that has documentation
                collapsedPath = collapsedPath ? collapsedPath + '/' + only.name : only.name;
                collapsedLabel += '/' + (only.displayName || only.name);
                displayNode = only;
            } else {
                break;
            }
        }
    }

    const isSelected = selectedPath === collapsedPath;
    const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = displayNode.children ? displayNode.children.some(c => nodeMatches(c, searchTerm)) : false;
    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    const score = computeNodeScore(displayNode);

    return html`
        <div style="margin-left:${depth * 8}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 tabindex=${collapsedPath === focusedPath ? '0' : '-1'}
                 role="treeitem" aria-selected=${isSelected}
                 data-tree-path=${collapsedPath}
                 onClick=${() => onSelect(collapsedPath, displayNode)}>
                <span class="req-tree-icon">${folderIcon}</span>
                <span class="req-tree-label">${isRoot ? (node.displayName || node.name) : collapsedLabel}</span>
                <span class="req-tree-metrics">
                    <span class="req-tree-confidence" style="color:${confidenceColor(score.confidence)}" title="Confidence: ${score.confidence}%"><span class="req-tree-confidence-icon">◐</span>${score.confidence}%</span>
                    <${SegmentedBar} outcomes=${displayNode.outcomes} />
                </span>
            </div>
            ${sortChildren(displayNode.children, sortMode).map(child => html`
                <${TreeNode} node=${child} onSelect=${onSelect}
                    selectedPath=${selectedPath} focusedPath=${focusedPath} depth=${depth + 1}
                    path=${collapsedPath} searchTerm=${searchTerm} nodeFilter=${nodeFilter}
                    sortMode=${sortMode} />
            `)}
        </div>
    `;
}
