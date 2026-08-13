import { expect, test } from '@playwright/test';

import { collapseNode } from '../../app/components/capabilities/collapseLogic.js';
import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';

function node(overrides: Partial<ReportCapabilityNode> = {}): ReportCapabilityNode {
    return {
        name: overrides.name || 'test-node',
        type: overrides.type || 'directory',
        outcomes: overrides.outcomes || { passed: 1, failed: 0, error: 0, pending: 0, skipped: 0, compromised: 0 },
        children: overrides.children,
        displayName: overrides.displayName,
        readme: overrides.readme,
    } as ReportCapabilityNode;
}

test.describe('collapseNode', () => {

    test('joins collapsed path segments with spaced separators', () => {
        const tree = node({
            name: 'parent',
            children: [node({
                name: 'child',
                children: [node({
                    name: 'grandchild',
                    children: [
                        node({ name: 'a.spec.ts', type: 'file' }),
                        node({ name: 'b.spec.ts', type: 'file' }),
                    ],
                })],
            })],
        });

        const result = collapseNode(tree, 'parent');
        expect(result.collapsedLabel).toBe('parent / child / grandchild');
        expect(result.collapsedPath).toBe('parent/child/grandchild');
    });

    test('does not collapse when node has files among its children', () => {
        const tree = node({
            name: 'src',
            children: [
                node({ name: 'test.spec.ts', type: 'file' }),
                node({
                    name: 'sub',
                    children: [node({ name: 'a.spec.ts', type: 'file' })],
                }),
            ],
        });

        const result = collapseNode(tree, 'src');
        expect(result.collapsedLabel).toBe('src');
        expect(result.collapsedPath).toBe('src');
    });

    test('does not collapse past a node with a readme', () => {
        const tree = node({
            name: 'features',
            children: [node({
                name: 'auth',
                readme: '<h1>Auth</h1>',
                children: [node({ name: 'login.spec.ts', type: 'file' })],
            })],
        });

        const result = collapseNode(tree, 'features');
        expect(result.collapsedLabel).toBe('features');
        expect(result.collapsedPath).toBe('features');
    });

    test('uses displayName when available', () => {
        const tree = node({
            name: 'cucumber-10',
            displayName: 'Cucumber 10',
            children: [node({
                name: 'features',
                displayName: 'Features',
                children: [
                    node({ name: 'a.feature', type: 'file' }),
                ],
            })],
        });

        const result = collapseNode(tree, 'cucumber-10');
        expect(result.collapsedLabel).toBe('Cucumber 10 / Features');
        expect(result.collapsedPath).toBe('cucumber-10/features');
    });

    test('does not collapse the initial node when it has a readme', () => {
        const tree = node({
            name: 'docs',
            readme: '<h1>Docs</h1>',
            children: [node({
                name: 'api',
                children: [node({ name: 'routes.spec.ts', type: 'file' })],
            })],
        });

        const result = collapseNode(tree, 'docs');
        expect(result.collapsedLabel).toBe('docs');
        expect(result.collapsedPath).toBe('docs');
    });

    test('preserves raw path separator without spaces in collapsedPath', () => {
        const tree = node({
            name: 'a',
            children: [node({
                name: 'b',
                children: [node({
                    name: 'c',
                    children: [node({
                        name: 'd',
                        children: [
                            node({ name: 'x.spec.ts', type: 'file' }),
                            node({ name: 'y.spec.ts', type: 'file' }),
                        ],
                    })],
                })],
            })],
        });

        const result = collapseNode(tree, 'a');
        expect(result.collapsedLabel).toBe('a / b / c / d');
        expect(result.collapsedPath).toBe('a/b/c/d');
    });
});
