import { expect, test } from '@playwright/test';

import { buildNodeFilter, computeHealthCounts } from '../../app/utils/capabilityFiltering.js';
import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';

function node(overrides: Partial<ReportCapabilityNode> = {}): ReportCapabilityNode {
    return {
        name: overrides.name || 'test-node',
        type: overrides.type || 'directory',
        outcomes: overrides.outcomes || { passed: 5, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 },
        children: overrides.children,
        displayName: overrides.displayName,
        readme: overrides.readme,
        score: overrides.score,
    } as ReportCapabilityNode;
}

test.describe('buildNodeFilter', () => {

    test('returns null for "all" filter (no filtering)', () => {
        expect(buildNodeFilter('all')).toBeNull();
    });

    test('returns null for unknown filter values', () => {
        expect(buildNodeFilter('nonexistent')).toBeNull();
    });

    test('returns a filter for "critical" that matches nodes with confidence < 50', () => {
        const filter = buildNodeFilter('critical');
        expect(filter).not.toBeNull();
        // Node with all pending outcomes -> 0% confidence
        const criticalNode = node({ outcomes: { passed: 0, failed: 0, error: 0, pending: 5, skipped: 0, compromised: 0 } });
        expect(filter!(criticalNode)).toBe(true);
        // Node with all passed -> 100% confidence
        const healthyNode = node({ outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 } });
        expect(filter!(healthyNode)).toBe(false);
    });

    test('returns a filter for "at-risk" that matches nodes with confidence >= 50 and < 90', () => {
        const filter = buildNodeFilter('at-risk');
        expect(filter).not.toBeNull();
        // Node with mixed results: 7 passed, 3 failed = 70% pass rate out of 10
        const atRiskNode = node({ outcomes: { passed: 7, failed: 3, error: 0, pending: 0, skipped: 0, compromised: 0 } });
        expect(filter!(atRiskNode)).toBe(true);
        // Node with all passed -> 100% confidence
        const healthyNode = node({ outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 } });
        expect(filter!(healthyNode)).toBe(false);
    });

    test('returns a filter for "healthy" that matches nodes with confidence >= 90', () => {
        const filter = buildNodeFilter('healthy');
        expect(filter).not.toBeNull();
        const healthyNode = node({ outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 } });
        expect(filter!(healthyNode)).toBe(true);
        const atRiskNode = node({ outcomes: { passed: 7, failed: 3, error: 0, pending: 0, skipped: 0, compromised: 0 } });
        expect(filter!(atRiskNode)).toBe(false);
    });

    test('returns a filter for "gaps" that matches nodes with pending or empty specs', () => {
        const filter = buildNodeFilter('gaps');
        expect(filter).not.toBeNull();
        const gapNode = node({
            type: 'directory',
            children: [node({ type: 'file', outcomes: { passed: 0, failed: 0, error: 0, pending: 2, skipped: 0, compromised: 0 } })],
        });
        expect(filter!(gapNode)).toBe(true);
        const completeNode = node({
            type: 'directory',
            children: [node({ type: 'file', outcomes: { passed: 5, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 } })],
        });
        expect(filter!(completeNode)).toBe(false);
    });
});

test.describe('computeHealthCounts', () => {

    test('returns zeros when capabilities has no children', () => {
        const root = node({ children: undefined });
        const counts = computeHealthCounts(root);
        expect(counts).toEqual({ healthy: 0, atRisk: 0, critical: 0, gaps: 0, total: 0 });
    });

    test('counts healthy directories (confidence >= 90)', () => {
        const root = node({
            children: [
                node({ name: 'a', outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 }, children: [] }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.healthy).toBe(1);
        expect(counts.total).toBe(1);
    });

    test('counts at-risk directories (confidence >= 50 and < 90)', () => {
        const root = node({
            children: [
                node({ name: 'a', outcomes: { passed: 7, failed: 3, error: 0, pending: 0, skipped: 0, compromised: 0 }, children: [] }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.atRisk).toBe(1);
        expect(counts.total).toBe(1);
    });

    test('counts critical directories (confidence < 50)', () => {
        const root = node({
            children: [
                node({ name: 'a', outcomes: { passed: 0, failed: 0, error: 0, pending: 10, skipped: 0, compromised: 0 }, children: [] }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.critical).toBe(1);
        expect(counts.total).toBe(1);
    });

    test('counts directories with gaps', () => {
        const root = node({
            children: [
                node({
                    name: 'a',
                    outcomes: { passed: 5, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 },
                    children: [
                        node({ type: 'file', name: 'spec.ts', outcomes: { passed: 0, failed: 0, error: 0, pending: 1, skipped: 0, compromised: 0 } }),
                    ],
                }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.gaps).toBe(1);
    });

    test('walks nested directory children recursively', () => {
        const root = node({
            children: [
                node({
                    name: 'parent',
                    outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 },
                    children: [
                        node({
                            name: 'child',
                            outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 },
                            children: [],
                        }),
                    ],
                }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.healthy).toBe(2);
        expect(counts.total).toBe(2);
    });

    test('skips file-type children', () => {
        const root = node({
            children: [
                node({ type: 'file', name: 'spec.ts', outcomes: { passed: 10, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 } }),
            ],
        });
        const counts = computeHealthCounts(root);
        expect(counts.total).toBe(0);
    });
});
