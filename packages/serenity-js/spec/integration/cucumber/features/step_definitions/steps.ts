enum StepInterface {
    SYNCHRONOUS,
    CALLBACK,
    PROMISE,
    GENERATOR,
}

enum StepResult {
    SUCCESS,
    FAILURE,
    PENDING,
}

function createFailingStep(stepInterface: StepInterface) {
    switch (stepInterface) {
        case StepInterface.CALLBACK:
            return cb => {
                process.nextTick(cb.bind(null, new Error('Assertion failed')));
            };
        case StepInterface.PROMISE:
            return () => {
                return new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        reject(new Error('Assertion failed'));
                    });
                });
            };
        case StepInterface.GENERATOR:
            return function*() {
                yield new Promise(process.nextTick);
                throw new Error('Assertion failed');
            };
        case StepInterface.SYNCHRONOUS:
        default:
            return () => {
                throw new Error('Assertion failed');
            };
    }
}

function createPassingStep(stepInterface: StepInterface, result: StepResult) {
    const resultValue = StepResult[result].toLowerCase();
    switch (stepInterface) {
        case StepInterface.CALLBACK:
            return cb => {
                process.nextTick(cb.bind(null, null, resultValue));
            };
        case StepInterface.PROMISE:
            return () => {
                return new Promise(resolve => process.nextTick(() => resolve(resultValue)));
            };
        case StepInterface.GENERATOR:
            return function*() {
                yield new Promise(process.nextTick);
                return resultValue;
            };
        case StepInterface.SYNCHRONOUS:
        default:
            return () => {
                return resultValue;
            };
    }
}

function createSlowStep(stepInterface: StepInterface, timeout: number) {
    switch (stepInterface) {
        case StepInterface.CALLBACK:
            return cb => {
                setTimeout(cb, timeout);
            };
        case StepInterface.GENERATOR:
            return function*() {
                yield new Promise(resolve => setTimeout(resolve, timeout));
            };
        case StepInterface.PROMISE:
        default:
            return () => {
                return new Promise(resolve => setTimeout(resolve, timeout));
            };
    }
}

function createStep(stepInterface: StepInterface, result: StepResult) {
    if (result === StepResult.FAILURE) {
        return createFailingStep(stepInterface);
    }
    return createPassingStep(stepInterface, result);
}

export = function() {

    this.Given(/^a step that passes$/,
        createStep(StepInterface.PROMISE, StepResult.SUCCESS));

    this.Given(/^a step that passes with a synchronous interface$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.SUCCESS));

    this.Given(/^a step that passes with a callback interface$/,
        createStep(StepInterface.CALLBACK, StepResult.SUCCESS));

    this.Given(/^a step that passes with a promise interface$/,
        createStep(StepInterface.PROMISE, StepResult.SUCCESS));

    this.Given(/^a step that passes with a generator interface$/,
        createStep(StepInterface.GENERATOR, StepResult.SUCCESS));

    this.Given(/^a step that fails with a synchronous interface$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.FAILURE));

    this.Given(/^a step that fails with a callback interface$/,
        createStep(StepInterface.CALLBACK, StepResult.FAILURE));

    this.Given(/^a step that fails with a promise interface$/,
        createStep(StepInterface.PROMISE, StepResult.FAILURE));

    this.Given(/^a step that fails with a generator interface$/,
        createStep(StepInterface.GENERATOR, StepResult.FAILURE));

    this.Given(/^a pending step with a synchronous interface$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.PENDING));

    this.Given(/^a pending step with a callback interface$/,
        createStep(StepInterface.CALLBACK, StepResult.PENDING));

    this.Given(/^a pending step with a promise interface$/,
        createStep(StepInterface.PROMISE, StepResult.PENDING));

    this.Given(/^a pending step with a generator interface$/,
        createStep(StepInterface.GENERATOR, StepResult.PENDING));

    this.Given(/^the following.*$/, data => Promise.resolve());

    this.Given(/^an example.ts file with the following contents:$/, docstring => Promise.resolve());

    this.Given(/^a slow, callback step$/,  { timeout: 100 }, createSlowStep(StepInterface.CALLBACK,  10000));
    this.Given(/^a slow, generator step$/, { timeout: 100 }, createSlowStep(StepInterface.GENERATOR, 10000));
    this.Given(/^a slow, promise step$/,   { timeout: 100 }, createSlowStep(StepInterface.PROMISE,   10000));
};
