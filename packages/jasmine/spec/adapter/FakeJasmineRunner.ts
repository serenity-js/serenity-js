import * as sinon from 'sinon';

export class FakeJasmineRunner {
    static instance: FakeJasmineRunner;

    clearReporters  = sinon.spy();

    loadConfig      = sinon.spy();

    addReporter     = sinon.spy();
    addSpecFiles    = sinon.spy();
    execute         = sinon.spy();

    configureDefaultReporter = sinon.spy();

    private callback: (passed: boolean) => void;

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
