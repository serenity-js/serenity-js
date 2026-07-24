import type { ReportCapabilityNode } from '../../../src/cli/ReportData';

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

/**
 * Collapses single-directory children (GitHub-style path collapsing).
 * Stops at nodes with a readme (documentation targets) or multiple children.
 */
export function collapseNode(node: ReportCapabilityNode, segmentPath: string): CollapsedNode {
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!node.readme && !hasFiles(node)) {
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
    return { displayNode, collapsedPath, collapsedLabel };
}
