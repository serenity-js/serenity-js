import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { Dispatcher, Server } from '../../../src/mcp/index.js';

describe('Server', () => {

    describe('stop()', () => {

        it('creates a callback that calls the exitFunction when the server is stopped', async () => {

            const dispatcher = sinon.createStubInstance(Dispatcher);

            const server = new Server(dispatcher);

            const exitFunction = sinon.spy();

            const processExitHandlerCallback = server.shutdown(exitFunction);

            await processExitHandlerCallback();

            expect(exitFunction.callCount).to.equal(1);
            expect(dispatcher.close.callCount).to.equal(1);
        });

        it('ensures the exitFunction is called at most once', async () => {

            const dispatcher = sinon.createStubInstance(Dispatcher);

            const server = new Server(dispatcher);

            const exitFunction = sinon.spy();

            const processExitHandlerCallback = server.shutdown(exitFunction);

            await processExitHandlerCallback();
            await processExitHandlerCallback();
            await processExitHandlerCallback();

            expect(exitFunction.callCount).to.equal(1);
            expect(dispatcher.close.callCount).to.equal(1);
        });
    })
});
