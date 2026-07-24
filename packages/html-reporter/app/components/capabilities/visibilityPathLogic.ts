import type { ReportCapabilityNode } from '../../../src/cli/ReportData';
import { collapseNode, matches } from './collapseLogic';

function isVisibleDirectory(node: ReportCapabilityNode): boolean {
    return node.type === 'directory' && !!node.children && node.children.length > 0;
}

function shouldIncludeNode(
    node: ReportCapabilityNode,
    searchTerm: string,
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null,
): boolean {
    if (!isVisibleDirectory(node)) return false;
    if (nodeFilter && !nodeFilter(node)) return false;
    if (searchTerm && !matches(node, searchTerm)) return false;
    return true;
}

export function countVisibleNodes(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): number {
    let count = 0;
    function walk(node: ReportCapabilityNode) {
        if (!node.children) return;
        for (const child of node.children) {
            if (!shouldIncludeNode(child, searchTerm, nodeFilter)) continue;
            count++;
            walk(child);
        }
    }
    walk(root);
    return count;
}

function computeCollapsedEntry(
    node: ReportCapabilityNode,
    parentPath: string,
    isRoot: boolean,
    searchTerm: string,
): { displayNode: ReportCapabilityNode; collapsedPath: string } | null {
    const segmentPath = isRoot ? '' : (parentPath ? parentPath + '/' + node.name : node.name);

    const { displayNode, collapsedPath, collapsedLabel } = isRoot
        ? { displayNode: node, collapsedPath: segmentPath, collapsedLabel: node.displayName || node.name }
        : collapseNode(node, segmentPath);

    if (searchTerm) {
        const matchesSearch = collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const childrenMatch = displayNode.children ? displayNode.children.some(c => matches(c, searchTerm)) : false;
        if (!matchesSearch && !childrenMatch) return null;
    }

    return { displayNode, collapsedPath };
}

export function getVisiblePaths(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): string[] {
    const paths: string[] = [];

    function walk(node: ReportCapabilityNode, parentPath: string, isRoot: boolean) {
        if (!isVisibleDirectory(node)) return;
        if (!isRoot && nodeFilter && !nodeFilter(node)) return;

        const entry = computeCollapsedEntry(node, parentPath, isRoot, searchTerm);
        if (!entry) return;

        paths.push(entry.collapsedPath);

        if (entry.displayNode.children) {
            for (const child of entry.displayNode.children) {
                walk(child, entry.collapsedPath, false);
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
