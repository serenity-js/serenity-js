/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as sinon from 'sinon';

export class FakeJasmineRunner {
    static instance: FakeJasmineRunner;
    static topSuite = sinon.stub();

    clearReporters  = sinon.spy();

    loadConfig      = sinon.spy();
    loadSpecs       = sinon.spy();
    loadHelpers     = sinon.spy();
    loadRequires    = sinon.spy();

    addReporter     = sinon.spy();
    addMatchingSpecFiles    = sinon.spy();
    execute         = sinon.spy();

    configureDefaultReporter = sinon.spy();

    exitOnCompletion = false;

    public readonly jasmine = {
        DEFAULT_TIMEOUT_INTERVAL: undefined,
        Suite: () => void 0,
        Spec: () => void 0,
        getEnv() {
            return {
                beforeEach: () => void 0,
                afterAll: () => void 0,
            };
        },
    }

    public readonly env = {
        configure:  sinon.spy(),
        topSuite:   FakeJasmineRunner.topSuite,
    }

    constructor() {
        FakeJasmineRunner.instance = this;
    }
}
