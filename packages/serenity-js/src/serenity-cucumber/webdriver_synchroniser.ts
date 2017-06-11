import { Deferred } from '@serenity-js/core/lib/recording/async';
import withArityOf = require('util-arity');
import { StepDefinitions } from 'cucumber';
import * as webdriver from 'selenium-webdriver';

const isGenerator = require('is-generator');    // tslint:disable-line:no-var-requires - JS module with no typings
const co = require('co');                       // tslint:disable-line:no-var-requires - JS module with no typings

/**
 * Monkey-patches Cucumber.js Given/When/Then step generators to ensure that any step definition they create
 * is executed within WebDriver's ControlFlow and therefore synchronised with it
 *
 * @param cucumber
 * @param controlFlow
 */
export function synchronise(cucumber: StepDefinitions, controlFlow: webdriver.promise.ControlFlow) {

    [
        'Given',
        'When',
        'Then',
    ]
    .forEach( stepGenerator => cucumber[stepGenerator] = synchronising(cucumber[stepGenerator]));

    // ---

    /**
     * Creates a synchronising StepGenerator, which looks like a regular StepGenerator but with this significant
     * difference, that any step function passed to it will be wrapped and executed in the context of WebDriver
     * Control Flow
     *
     * @param originalStepGenerator
     * @return {StepGenerator}
     */
    function synchronising(originalStepGenerator: StepGenerator): StepGenerator {

        function synchronisingStepGenerator(pattern: string, options: any, code?: SomeFunction) {

            const
                originalStep = code || options,
                synchronised = mimicArity(originalStep, synchronisedStep(originalStep));

            const params = !! code
                ? [ pattern, options, synchronised ]
                : [ pattern, synchronised ];

            return originalStepGenerator.apply(cucumber, params);
        }

        return mimicArity (originalStepGenerator, synchronisingStepGenerator);
    }

    /**
     * Provides a synchronised wrapper around the user-defined step
     *
     * @param originalStep
     * @return {(...args:any[])=>(Promise<void> | void)}
     */
    function synchronisedStep(originalStep: SomeFunction) {

        return mimicInterface(originalStep, function stepWrapper(...args: any[]) {

            const
                deferred = new Deferred<void>(),
                context  = this;

            if (isGenerator.fn(originalStep)) {
                originalStep = co.wrap(originalStep);
            }

            controlFlow
                .execute(() => originalStep.apply(context, args) )
                .then(deferred.resolve, deferred.reject);

            return deferred.promise;
        });
    }
}

/**
 * Assumes that step definition has a callback interface if the number of parameters passed by cucumber
 * matches its signature
 *
 * @return boolean
 * @param step
 * @param params
 */
function hasCallbackInterface(step: SomeFunction, params: any[]): boolean {
    return step.length === params.length;
}

/**
 * Makes the pretender function conform to original function interface (i.e. callback- or promise-based)
 *
 * @param original
 * @param pretender
 * @return {StepDefinition}
 */
function mimicInterface(original: StepDefinition, pretender: SomeFunctionReturningPromise): StepDefinition {
    return function stepWrapper(...args: any[]): Promise<void> | void {

        const
            context  = this,
            result = pretender.apply(context, args);

        if (!hasCallbackInterface(original, args)) {
            return result;
        }
    };
}

/**
 * Makes the pretender function of the same arity as the original one to deceive cucumber.
 *
 * @param original
 * @param pretender
 * @return {(...args:any[])=>any}
 */
function mimicArity(original: SomeFunction, pretender: SomeFunction): SomeFunction {
    return withArityOf(original.length, pretender);
}

type SomeFunction = (...args: any[]) => any;
type SomeFunctionReturningPromise = (...args: any[]) => Promise<void>;
type StepDefinition = (...args: any[]) => Promise<void> | void;
type StepGenerator = (pattern: string, options: any, code?: any) => void;
