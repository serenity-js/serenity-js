import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { CallToolInstruction, Context } from '../../../src/mcp/index.js';
import { exampleNavigateToUrlResult, ExampleNavigateToUrlTool } from './examples/ExampleNavigateToUrlTool.js';

describe('Tool', () => {

    describe('name()', () => {

        it('returns the tool name in snake_case without the "Tool" suffix for auto-generated names', () => {
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context);

            expect(tool.name()).to.equal('serenity_example_navigate_to_url');
        });

        it('returns the namespaced tool name as provided in the config', () => {
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context, { name: 'custom_tool_name' });

            expect(tool.name()).to.equal('serenity_custom_tool_name');
        });

        it('uses provided namespace if provided', () => {
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context, { namespace: 'acme', name: 'custom_tool_name' });

            expect(tool.name()).to.equal('acme_custom_tool_name');
        });
    });

    describe('matches()', () => {
        it('returns true for matching tool name', () => {
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context);

            expect(tool.matches('serenity_example_navigate_to_url')).to.equal(true);
        });

        it('returns false for non-matching tool name', () => {
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context);

            expect(tool.matches('different_tool')).to.equal(false);
        });
    });

    describe('handle()', () => {

        it('should return structuredContent and matching content for successful operations', async () => {

            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context);

            const response = await tool.callTool({ url: 'https://example.org' });

            const expectedResult = exampleNavigateToUrlResult('https://example.org');

            expect(response.isError).to.equal(false);
            expect(response.structuredContent.result).to.deep.equal(expectedResult);
            expect(response.content).to.deep.equal([
                {
                    type: 'text',
                    text: JSON.stringify(expectedResult, undefined, 0),
                }
            ]);
        });

        it('should add any extra instructions to both content and structuredContent', async () => {

            const instructions = [
                new CallToolInstruction('website_snapshot', `Understand what's changed`),
                new CallToolInstruction('generate_page_objects', `Know how to structure the UI interaction code`),
            ];

            const config = {};
            const context = new Context();
            const tool = new ExampleNavigateToUrlTool(context, config, instructions);

            const response = await tool.callTool({ url: 'https://example.org' });

            const expectedResult = exampleNavigateToUrlResult('https://example.org');

            expect(response.isError).to.equal(false);
            expect(response.structuredContent.result).to.deep.equal(expectedResult);

            expect(response.structuredContent.instructions).to.deep.equal([{
                type: 'callTool',
                target: 'website_snapshot',
                reason: `Understand what's changed`
            }, {
                type: 'callTool',
                target: 'generate_page_objects',
                reason: `Know how to structure the UI interaction code`
            } ]);

            expect(response.content).to.deep.equal([ {
                type: 'text',
                text: JSON.stringify(expectedResult, undefined, 0),
            }, {
                type: 'text',
                text: `Instruction 1: Call tool website_snapshot to understand what's changed`,
            }, {
                type: 'text',
                text: `Instruction 2: Call tool generate_page_objects to know how to structure the UI interaction code`,
            } ]);
        });
    });
});
