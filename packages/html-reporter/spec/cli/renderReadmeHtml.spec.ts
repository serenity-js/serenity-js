/**
 * Tests verifying that the extracted renderReadmeHtml function correctly
 * transforms relative directory links to in-report navigation links.
 *
 * This test directly exercises the rendering function to expose the
 * this-binding issue with marked's Renderer when the link method is
 * assigned as an own property rather than provided via marked.use().
 */
import { expect, test } from '@playwright/test';

import { renderReadmeHtml } from '../../src/cli/capabilities/buildCapabilities.js';
import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';

function makeNode(name: string): ReportCapabilityNode {
    return {
        type: 'directory',
        name,
        outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenarioCount: 0,
        children: [],
    };
}

test.describe('renderReadmeHtml', () => {

    test.describe('directory link transformation', () => {

        test('transforms a relative directory link when the target exists in the nodeMap', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));
            nodeMap.set('e2e', makeNode('e2e'));

            const html = renderReadmeHtml(
                '[End-to-End Flows](./e2e/)',
                '',
                nodeMap,
                undefined,
            );

            expect(html).toContain('<a href="#/capabilities?path=e2e">End-to-End Flows</a>');
        });

        test('transforms a directory link without trailing slash when node exists', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));
            nodeMap.set('e2e', makeNode('e2e'));

            const html = renderReadmeHtml(
                '[End-to-End Flows](./e2e)',
                '',
                nodeMap,
                undefined,
            );

            expect(html).toContain('<a href="#/capabilities?path=e2e">End-to-End Flows</a>');
        });

        test('resolves directory links relative to the current node path', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));
            nodeMap.set('scenarios', makeNode('scenarios'));

            const html = renderReadmeHtml(
                '[Scenarios](../scenarios/)',
                'dashboard',
                nodeMap,
                undefined,
            );

            expect(html).toContain('<a href="#/capabilities?path=scenarios">Scenarios</a>');
        });

        test('renders the link text correctly using the parser', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));
            nodeMap.set('e2e', makeNode('e2e'));

            const html = renderReadmeHtml(
                '[**Bold** End-to-End Flows](./e2e/)',
                '',
                nodeMap,
                undefined,
            );

            // The link text should be parsed as inline markdown (bold rendered)
            expect(html).toContain('<strong>Bold</strong> End-to-End Flows');
            expect(html).toContain('href="#/capabilities?path=e2e"');
        });
    });

    test.describe('heading stripping', () => {

        test('strips the first heading from rendered HTML when displayName is provided', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));
            nodeMap.set('e2e', makeNode('e2e'));

            const html = renderReadmeHtml(
                '# Test Project\n\n[End-to-End Flows](./e2e/)',
                '',
                nodeMap,
                'Test Project',
            );

            expect(html).not.toContain('<h1>');
            expect(html).toContain('<a href="#/capabilities?path=e2e">End-to-End Flows</a>');
        });

        test('does not strip headings when displayName is undefined', () => {
            const nodeMap = new Map<string, ReportCapabilityNode>();
            nodeMap.set('', makeNode('spec'));

            const html = renderReadmeHtml(
                '# Test Project\n\nSome content',
                '',
                nodeMap,
                undefined,
            );

            expect(html).toContain('<h1>');
        });
    });
});
