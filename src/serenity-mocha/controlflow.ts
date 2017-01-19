
// tslint:disable

/*

 Below code is copied and pasted from
 https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/testing/index.js
 because the lazy loading introduced in
 https://github.com/SeleniumHQ/selenium/commit/1decc7dab56736d0cab4ea886d836d8c01227287
 causes circular references when I try to use the selenium-webdriver/testing package programmatically.

 */

let promise = require('selenium-webdriver').promise;

const flow = (function() {
    const initial = process.env['SELENIUM_PROMISE_MANAGER'];
    try {
        process.env['SELENIUM_PROMISE_MANAGER'] = '1';
        return promise.controlFlow();
    } finally {
        if (initial === undefined) {
            delete process.env['SELENIUM_PROMISE_MANAGER'];
        } else {
            process.env['SELENIUM_PROMISE_MANAGER'] = initial;
        }
    }
})();

function wrapArgument(value) {
    if (typeof value === 'function') {
        return makeAsyncTestFn(value);
    }
    return value;
}

/**
 * Wraps a function on Mocha's BDD interface so it runs inside a
 * webdriver.promise.ControlFlow and waits for the flow to complete before
 * continuing.
 * @param {!Function} globalFn The function to wrap.
 * @return {!Function} The new function.
 */
export function wrapped(globalFn) {
    return function() {
        if (arguments.length === 1) {
            return globalFn(wrapArgument(arguments[0]));

        } else if (arguments.length === 2) {
            return globalFn(arguments[0], wrapArgument(arguments[1]));

        } else {
            throw Error('Invalid # arguments: ' + arguments.length);
        }
    };
}

/**
 * Wraps a function so that all passed arguments are ignored.
 * @param {!Function} fn The function to wrap.
 * @return {!Function} The wrapped function.
 */
function seal(fn) {
    return function() {
        fn();
    };
}

/**
 * Make a wrapper to invoke caller's test function, fn.  Run the test function
 * within a ControlFlow.
 *
 * Should preserve the semantics of Mocha's Runnable.prototype.run (See
 * https://github.com/mochajs/mocha/blob/master/lib/runnable.js#L192)
 *
 * @param {!Function} fn
 * @return {!Function}
 */
function makeAsyncTestFn(fn) {
    var isAsync = fn.length > 0;
    var isGenerator = promise.isGenerator(fn);
    if (isAsync && isGenerator) {
        throw new TypeError(
            'generator-based tests must not take a callback; for async testing,'
            + ' return a promise (or yield on a promise)');
    }

    var ret = /** @type {function(this: mocha.Context)}*/ function(done) {
        var self = this;
        var runTest = function(resolve, reject) {
            try {
                if (self.isAsync) {
                    fn.call(self, function(err) { err ? reject(err) : resolve(); });
                } else if (self.isGenerator) {
                    resolve(promise.consume(fn, self));
                } else {
                    resolve(fn.call(self));
                }
            } catch (ex) {
                reject(ex);
            }
        };

        if (!promise.USE_PROMISE_MANAGER) {
            new promise.Promise(runTest).then(seal(done), done);
            return;
        }

        var runnable = this.runnable();
        var mochaCallback = runnable.callback;
        runnable.callback = function() {
            flow.reset();
            return mochaCallback.apply(this, arguments);
        };

        flow.execute(function controlFlowExecute() {
            return new promise.Promise(function(fulfill, reject) {
                return runTest(fulfill, reject);
            }, flow);
        }, runnable.fullTitle()).then(seal(done), done);
    };

    ret.toString = function() {
        return fn.toString();
    };

    return ret;
}

// tslint:enable
