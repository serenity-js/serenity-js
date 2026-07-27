import type { ReportCapabilityNode } from '../../../src/cli/ReportData.js';

function hasFiles(node: ReportCapabilityNode): boolean {
    return !!(node.children && node.children.some(c => c.type === 'file'));
}

export function matches(node: ReportCapabilityNode, term: string): boolean {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => matches(c, term));
    return false;
}

export interface CollapsedNode {
    displayNode: ReportCapabilityNode;
    collapsedPath: string;
    collapsedLabel: string;
}

function getOnlyCollapsibleDirectory(node: ReportCapabilityNode): ReportCapabilityNode | null {
    if (!node.children) return null;
    const directories = node.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
    const files = node.children.filter(c => c.type === 'file');
    if (directories.length === 1 && files.length === 0 && !directories[0].readme) {
        return directories[0];
    }
    return null;
}

/**
 * Collapses single-directory children (GitHub-style path collapsing).
 * Stops at nodes with a readme (documentation targets) or multiple children.
 */
export function collapseNode(node: ReportCapabilityNode, segmentPath: string): CollapsedNode {
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;

    if (!node.readme && !hasFiles(node)) {
        let next = getOnlyCollapsibleDirectory(displayNode);
        while (next) {
            collapsedPath = collapsedPath ? collapsedPath + '/' + next.name : next.name;
            collapsedLabel += '/' + (next.displayName || next.name);
            displayNode = next;
            next = getOnlyCollapsibleDirectory(displayNode);
        }
    }

    return { displayNode, collapsedPath, collapsedLabel };
}
