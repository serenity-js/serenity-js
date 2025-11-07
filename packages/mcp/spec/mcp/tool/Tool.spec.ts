import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { CallToolInstruction, Context, ElicitInput } from '../../../src/mcp/index.js';
import { exampleNavigateToUrlStructuredContent, ExampleNavigateToUrlTool } from './examples/ExampleNavigateToUrlTool.js';

describe('Tool', () => {

    const dependencies = {
        context: sinon.createStubInstance(Context),
        input: sinon.createStubInstance(ElicitInput),
    }

    describe('name()', () => {

        it('returns the tool name in snake_case without the "Tool" suffix for auto-generated names', () => {
            const tool = new ExampleNavigateToUrlTool(dependencies);

            expect(tool.name()).to.equal('serenity_example_navigate_to_url');
        });

        it('returns the namespaced tool name as provided in the config', () => {
            const tool = new ExampleNavigateToUrlTool(dependencies, { name: 'custom_tool_name' });

            expect(tool.name()).to.equal('serenity_custom_tool_name');
        });

        it('uses provided namespace if provided', () => {
            const tool = new ExampleNavigateToUrlTool(dependencies, { namespace: 'acme', name: 'custom_tool_name' });

            expect(tool.name()).to.equal('acme_custom_tool_name');
        });
    });

    describe('matches()', () => {
        it('returns true for matching tool name', () => {
            const tool = new ExampleNavigateToUrlTool(dependencies);

            expect(tool.matches('serenity_example_navigate_to_url')).to.equal(true);
        });

        it('returns false for non-matching tool name', () => {
            const tool = new ExampleNavigateToUrlTool(dependencies);

            expect(tool.matches('different_tool')).to.equal(false);
        });
    });

    describe('handle()', () => {

        it('should return structuredContent and matching content for successful operations', async () => {

            const tool = new ExampleNavigateToUrlTool(dependencies);

            const response = await tool.callTool({
                method: 'tools/call',
                params: {
                    name: tool.name(),
                    arguments: { url: 'https://example.org' }
                }
            });

            const expectedStructuredContent = exampleNavigateToUrlStructuredContent('https://example.org');

            expect(response.isError).to.equal(false);
            expect(response.structuredContent).to.deep.equal(expectedStructuredContent);
            expect(response.content).to.deep.equal([
                {
                    type: 'text',
                    text: JSON.stringify(expectedStructuredContent, undefined, 0),
                }
            ]);
        });

        it('should add any extra instructions to both content and structuredContent', async () => {

            const instructions = [
                new CallToolInstruction('website_snapshot', `Understand what's changed`),
                new CallToolInstruction('generate_page_objects', `Learn how to structure the UI interaction code`),
            ];

            const config = {};
            const tool = new ExampleNavigateToUrlTool(dependencies, config, instructions);

            const response = await tool.callTool({
                method: 'tools/call',
                params: {
                    name: tool.name(),
                    arguments: { url: 'https://example.org' }
                }
            });

            const expectedStructuredContent = exampleNavigateToUrlStructuredContent('https://example.org', [{
                type: 'callTool',
                target: 'website_snapshot',
                reason: `Understand what's changed`
            }, {
                type: 'callTool',
                target: 'generate_page_objects',
                reason: `Learn how to structure the UI interaction code`
            } ]);

            expect(response.isError).to.equal(false);
            expect(response.structuredContent).to.deep.equal(expectedStructuredContent);

            expect(response.content).to.deep.equal([ {
                type: 'text',
                text: JSON.stringify(expectedStructuredContent, undefined, 0),
            }, {
                type: 'text',
                text: `Instruction 1: Call tool website_snapshot\n\nUnderstand what's changed`,
            }, {
                type: 'text',
                text: `Instruction 2: Call tool generate_page_objects\n\nLearn how to structure the UI interaction code`,
            } ]);
        });
    });
});
