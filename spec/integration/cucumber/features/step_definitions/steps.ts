enum StepInterface {
    SYNCHRONOUS,
    CALLBACK,
    PROMISE,
    GENERATOR
}

enum StepResult {
    success,
    failure,
    pending
}

function createFailingStep(stepInterface: StepInterface) {
    switch (stepInterface) {
        case StepInterface.SYNCHRONOUS:
            return () => {
                throw new Error('Assertion failed');
            };
        case StepInterface.CALLBACK:
            return (cb) => {
                process.nextTick(cb.bind(null, new Error('Assertion failed')));
            };
        case StepInterface.PROMISE:
            return () => {
                return new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        reject(new Error('Assertion failed'))
                    })
                });
            };
        case StepInterface.GENERATOR:
            return function*() {
                yield new Promise(process.nextTick);
                throw new Error('Assertion failed');
            }
    }
}

function createPassingStep(stepInterface: StepInterface, result: StepResult) {
    const resultValue = StepResult[result];
    switch (stepInterface) {
        case StepInterface.SYNCHRONOUS:
            return () => {
                return resultValue;
            };
        case StepInterface.CALLBACK:
            return (cb) => {
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
            }
    }
}

function createStep(stepInterface: StepInterface, result: StepResult) {
    if (result === StepResult.failure) {
        return createFailingStep(stepInterface);
    }
    return createPassingStep(stepInterface, result);
}

export = function () {

    this.Given(/^a step that passes$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.success));

    this.Given(/^a step that fails$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.failure));


    this.Given(/^a pending step with a synchronous interface$/,
        createStep(StepInterface.SYNCHRONOUS, StepResult.pending));

    this.Given(/^a pending step with a callback interface$/,
        createStep(StepInterface.CALLBACK, StepResult.pending));


    this.Given(/^a pending step with a promise interface$/,
        createStep(StepInterface.PROMISE, StepResult.pending));

    this.Given(/^a pending step with a generator interface$/,
        createStep(StepInterface.GENERATOR, StepResult.pending));
};
