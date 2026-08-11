import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';
import { nodeConfidence, nodeHasGap } from '../components/capabilities/CapabilityTree.js';

export interface HealthCounts {
    healthy: number;
    atRisk: number;
    critical: number;
    gaps: number;
    total: number;
}

export function buildNodeFilter(activeFilter: string): ((node: ReportCapabilityNode) => boolean) | null {
    if (activeFilter === 'critical') return (n: ReportCapabilityNode) => nodeConfidence(n) < 50;
    if (activeFilter === 'at-risk') return (n: ReportCapabilityNode) => { const s = nodeConfidence(n); return s >= 50 && s < 90; };
    if (activeFilter === 'healthy') return (n: ReportCapabilityNode) => nodeConfidence(n) >= 90;
    if (activeFilter === 'gaps') return nodeHasGap;
    return null;
}

export function computeHealthCounts(capabilities: ReportCapabilityNode): HealthCounts {
    let healthy = 0, atRisk = 0, critical = 0, gaps = 0;
    function walk(n: ReportCapabilityNode) {
        if (n.type === 'directory' && n.children) {
            const score = nodeConfidence(n);
            if (score < 50) critical++;
            else if (score < 90) atRisk++;
            else healthy++;
            if (nodeHasGap(n)) gaps++;
            n.children.forEach(walk);
        }
    }
    if (capabilities.children) capabilities.children.forEach(walk);
    return { healthy, atRisk, critical, gaps, total: healthy + atRisk + critical };
}
