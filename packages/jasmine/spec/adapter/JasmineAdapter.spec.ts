import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import * as sinon from 'sinon';

import { JasmineAdapter } from '../../src/adapter';
import { FakeJasmineRunner } from './FakeJasmineRunner';

/** @test JasmineAdapter */
describe('JasmineAdapter', () => {

    let loader: sinon.SinonStubbedInstance<ModuleLoader>;

    beforeEach(() => {
        loader = sinon.createStubInstance(ModuleLoader);
        (global as any).jasmine = {
            Suite: () => void 0,
            Spec: () => void 0,
            getEnv() {
                return {
                    beforeEach: () => void 0,
                    afterAll: () => void 0,
                };
            },
        };

        loader.require.withArgs('jasmine').returns(FakeJasmineRunner);
    });

    afterEach(() => {
        (global as any).jasmine = void 0;
    });

    /** @test JasmineAdapter#run */
    it('defaults to running tests sequentially rather than in a random order', () => {

        const
            config = {},
            specs  = [];

        const adapter = new JasmineAdapter(config, loader);

        const result = adapter.run(specs);

        FakeJasmineRunner.instance.complete(true);

        expect(FakeJasmineRunner.instance.loadConfig).to.have.been.calledWithMatch({
            random: false,
        });

        return result;
    });

    /** @test JasmineAdapter#run */
    it('configures the default timeout interval if required', () => {

        const
            defaultTimeoutInterval = 5000,
            config = {
                defaultTimeoutInterval,
            },
            specs  = [],
            globalScope = global as any;

        expect(globalScope.jasmine.DEFAULT_TIMEOUT_INTERVAL).to.equal(undefined);

        const adapter = new JasmineAdapter(config, loader);

        const result = adapter.run(specs);

        FakeJasmineRunner.instance.complete(true);

        expect(globalScope.jasmine.DEFAULT_TIMEOUT_INTERVAL).to.equal(defaultTimeoutInterval);

        return result;
    });
});
