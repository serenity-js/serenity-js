import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { CallToolInstruction } from '../../../src/mcp/index.js';

describe('instructions', () => {

    describe('CallTool', () => {

        describe('toJSON', () => {

            it('automatically generates the `type` based on the class name', () => {
                const callTool = new CallToolInstruction('browser_snapshot', `understand what's change on the website`);

                expect(callTool.toJSON()).deep.equal({
                    type: 'callTool',
                    target: 'browser_snapshot',
                    reason: `understand what's change on the website`
                });
            });
        });

        describe('description()', () => {

            it('generates an agent-readable description of the instruction', () => {
                const callTool = new CallToolInstruction('browser_snapshot', `Understand what's changed on the website`);

                expect(callTool.description()).equal(
                    `Call tool browser_snapshot to understand what's changed on the website`,
                );
            });
        });
    });
});
