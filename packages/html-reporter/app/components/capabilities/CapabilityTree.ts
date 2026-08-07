import htm from 'htm';
import { h } from 'preact';

import type { ReportCapabilityNode } from '../../../src/cli/reporting/ReportData.js';
import { capabilityConfidence, scoreColor } from '../../utils/index.js';
import { SegmentedBar } from '../common/charts/SegmentedBar.js';
import { icons } from '../common/icons.js';
import { collapseNode } from './capabilityTreeUtilities.js';

const html = htm.bind(h);

export function confidenceColor(score: number): string {
    return scoreColor(score) || 'inherit';
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
    const confidence = capabilityConfidence(passRate, completeness, consistency);
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

export type { CollapsedNode } from './capabilityTreeUtilities.js';
export { collapseNode, countVisibleNodes, getVisiblePaths, resolveTreeKeyNavigation } from './capabilityTreeUtilities.js';

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

interface ResolvedTreeDisplay {
    displayNode: ReportCapabilityNode;
    collapsedPath: string;
    collapsedLabel: string;
    isSelected: boolean;
    score: { confidence: number; passRate: number; completeness: number; consistency: number };
}

interface TreeDisplayContext {
    path: string;
    selectedPath: string;
    searchTerm: string;
    isRoot: boolean | undefined;
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null;
}

function resolveTreeDisplay(
    node: ReportCapabilityNode, context: TreeDisplayContext,
): ResolvedTreeDisplay | null {
    const { path, selectedPath, searchTerm, isRoot, nodeFilter } = context;
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    if (!isDirectory) return null;
    if (!isRoot && nodeFilter && !nodeFilter(node)) return null;

    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);

    const { displayNode, collapsedPath, collapsedLabel } = isRoot
        ? { displayNode: node, collapsedPath: segmentPath, collapsedLabel: node.displayName || node.name }
        : collapseNode(node, segmentPath);

    const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = displayNode.children ? displayNode.children.some(c => nodeMatches(c, searchTerm)) : false;
    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    return {
        displayNode,
        collapsedPath,
        collapsedLabel,
        isSelected: selectedPath === collapsedPath,
        score: computeNodeScore(displayNode),
    };
}

export function TreeNode({ node, onSelect, selectedPath, focusedPath, depth, path, searchTerm, isRoot, nodeFilter, sortMode }: TreeNodeProps): ReturnType<typeof html> | null {
    const resolved = resolveTreeDisplay(node, { path, selectedPath, searchTerm, isRoot, nodeFilter });
    if (!resolved) return null;

    const { displayNode, collapsedPath, collapsedLabel, isSelected, score } = resolved;

    return html`
        <div style="margin-left:${depth * 8}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 tabindex=${collapsedPath === focusedPath ? '0' : '-1'}
                 role="treeitem" aria-selected=${isSelected}
                 data-tree-path=${collapsedPath}
                 onClick=${() => onSelect(collapsedPath, displayNode)}>
                <span class="req-tree-icon">${icons.folder}</span>
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

