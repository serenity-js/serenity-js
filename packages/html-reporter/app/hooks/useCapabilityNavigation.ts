import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';
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

export function useCapabilityNavigation({ capabilities, route, searchTerm, activeFilter, activeSort }: CapabilityNavigationOptions): CapabilityNavigationResult {
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [focusedPath, setFocusedPath] = useState('');

    const hashNav = useHashHistory();

    // Track whether path change is user-initiated (needs pushState) vs URL-driven (already in history)
    const userNavigated = useRef(false);

    useEffect(() => {
        if (userNavigated.current) {
            userNavigated.current = false;
            // Push handled in handleSelect
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
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const pathFromUrl = params?.get('path') ?? '';
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
        // Push to history so browser back/forward works
        const params = new URLSearchParams();
        if (path) params.set('path', path);
        if (searchTerm) params.set('search', searchTerm);
        if (activeFilter && activeFilter !== 'all') params.set('filter', activeFilter);
        if (activeSort && activeSort !== 'name') params.set('sort', activeSort);
        const qs = params.toString();
        hashNav.push('/capabilities' + (qs ? '?' + qs : ''));
    };

    return { selectedPath, selectedNode, focusedPath, setFocusedPath, handleSelect };
}
