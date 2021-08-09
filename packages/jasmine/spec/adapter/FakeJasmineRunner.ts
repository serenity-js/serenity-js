/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as sinon from 'sinon';

export class FakeJasmineRunner {
    static instance: FakeJasmineRunner;
    static topSuite = sinon.stub();

    clearReporters  = sinon.spy();

    loadConfig      = sinon.spy();
    loadSpecs       = sinon.spy();

    addReporter     = sinon.spy();
    addSpecFiles    = sinon.spy();
    execute         = sinon.spy();

    configureDefaultReporter = sinon.spy();

    private callback: (passed: boolean) => void;

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

    onComplete(callback: (passed: boolean) => void): void {
        this.callback = callback;
    }

    complete(passed: boolean): void {
        this.callback(passed);
    }
}
