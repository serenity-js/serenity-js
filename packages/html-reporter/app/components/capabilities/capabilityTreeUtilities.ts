import type { ReportCapabilityNode } from '../../../src/cli/ReportData';

// Local helpers to avoid circular imports with CapabilityTree.ts
function hasFiles(node: ReportCapabilityNode): boolean {
    return !!(node.children && node.children.some(c => c.type === 'file'));
}

function matches(node: ReportCapabilityNode, term: string): boolean {
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

export function countVisibleNodes(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): number {
    let count = 0;
    function walk(node: ReportCapabilityNode) {
        if (!node.children) return;
        for (const child of node.children) {
            if (child.type !== 'directory' || !child.children || child.children.length === 0) continue;
            if (nodeFilter && !nodeFilter(child)) continue;
            if (searchTerm && !matches(child, searchTerm)) continue;
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
        const { displayNode, collapsedPath, collapsedLabel } = isRoot
            ? { displayNode: node, collapsedPath: segmentPath, collapsedLabel: node.displayName || node.name }
            : collapseNode(node, segmentPath);

        // Check search filtering
        const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const childrenMatch = displayNode.children ? displayNode.children.some(c => matches(c, searchTerm)) : false;
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

function navigateDown(currentIndex: number, visiblePaths: string[]): number {
    return Math.min(currentIndex + 1, visiblePaths.length - 1);
}

function navigateUp(currentIndex: number): number {
    return Math.max(currentIndex - 1, 0);
}

function navigateRight(currentIndex: number, visiblePaths: string[]): number {
    const prefix = visiblePaths[currentIndex] ? visiblePaths[currentIndex] + '/' : '';
    const childIndex = visiblePaths.findIndex((p, i) => i > currentIndex && p.startsWith(prefix));
    return childIndex !== -1 ? childIndex : currentIndex;
}

function navigateLeft(currentIndex: number, visiblePaths: string[]): number {
    const currentPath = visiblePaths[currentIndex] || '';
    const lastSlash = currentPath.lastIndexOf('/');

    if (lastSlash !== -1) {
        const parentIndex = visiblePaths.indexOf(currentPath.substring(0, lastSlash));
        return parentIndex !== -1 ? parentIndex : currentIndex;
    }

    if (currentPath !== '') {
        const rootIndex = visiblePaths.indexOf('');
        return rootIndex !== -1 ? rootIndex : currentIndex;
    }

    return currentIndex;
}

function navigateHome(): number {
    return 0;
}

function navigateEnd(visiblePaths: string[]): number {
    return visiblePaths.length - 1;
}

const keyHandlers: Record<string, (currentIndex: number, visiblePaths: string[]) => number> = {
    ArrowDown: navigateDown,
    ArrowUp: navigateUp,
    ArrowRight: navigateRight,
    ArrowLeft: navigateLeft,
    Home: navigateHome,
    End: (_currentIndex, visiblePaths) => navigateEnd(visiblePaths),
};

export function resolveTreeKeyNavigation(key: string, currentIndex: number, visiblePaths: string[]): number {
    const handler = keyHandlers[key];
    return handler ? handler(currentIndex, visiblePaths) : currentIndex;
}
