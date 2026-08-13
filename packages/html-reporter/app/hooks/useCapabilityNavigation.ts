import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';
import { link } from '../../src/navigation/link.js';
import { findNodeByPath } from '../components/capabilities/CapabilityTree.js';
import { useHashHistory } from '../utils/index.js';

export interface CapabilityNavigationOptions {
    capabilities: ReportCapabilityNode | undefined;
    route: string;
    searchTerm: string;
    activeFilter: string;
    activeSort: string;
}

export interface CapabilityNavigationResult {
    selectedPath: string;
    selectedNode: ReportCapabilityNode | null;
    focusedPath: string;
    setFocusedPath: (path: string) => void;
    handleSelect: (path: string, node: ReportCapabilityNode) => void;
}

function resolvePathFromRoute(route: string): string {
    const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    return params?.get('path') ?? '';
}

export function useCapabilityNavigation({ capabilities, route, searchTerm, activeFilter, activeSort }: CapabilityNavigationOptions): CapabilityNavigationResult {
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [focusedPath, setFocusedPath] = useState('');

    const hashNav = useHashHistory();
    const userNavigated = useRef(false);

    useEffect(() => {
        if (userNavigated.current) {
            userNavigated.current = false;
            return undefined;
        }
        if (selectedPath) {
            hashNav.setParam('path', selectedPath);
        } else {
            hashNav.deleteParam('path');
        }
        return undefined;
    }, [selectedPath]);

    useEffect(() => {
        if (!capabilities) return undefined;
        const pathFromUrl = resolvePathFromRoute(route);
        const node = findNodeByPath(capabilities, pathFromUrl);
        if (node) {
            setSelectedPath(pathFromUrl);
            setSelectedNode(node);
        }
        return undefined;
    }, [route, capabilities]);

    const handleSelect = (path: string, node: ReportCapabilityNode) => {
        setSelectedPath(path);
        setSelectedNode(node);
        userNavigated.current = true;
        hashNav.push(link({
            view: 'capabilities',
            path: path || undefined,
            search: searchTerm || undefined,
            filter: activeFilter && activeFilter !== 'all' ? activeFilter : undefined,
            sort: activeSort && activeSort !== 'name' ? activeSort : undefined,
        }));
    };

    return { selectedPath, selectedNode, focusedPath, setFocusedPath, handleSelect };
}
