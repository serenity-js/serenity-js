import { Deferred } from '../../serenity/recording/async';
import withArityOf = require('util-arity');
import { StepDefinitions } from 'cucumber';
import ControlFlow = protractor.promise.ControlFlow;

/**
 * Monkey-patches Cucumber.js Given/When/Then step generators to ensure that any step definition they create
 * is executed within WebDriver's ControlFlow and therefore synchronised with it
 *
 * @param cucumber
 * @param controlFlow
 */
export function synchroniseCucumberWithWebdriverControlFlow (cucumber: StepDefinitions, controlFlow: ControlFlow) {

    [
        'Given',
        'When',
        'Then',
    ]
    .forEach( stepGenerator => cucumber[stepGenerator] = synchronising(cucumber[stepGenerator]));

    // ---

    /**
     * Creates a synchronising StepGenerator, which looks like a regular StepGenerator but with this signifficant
     * difference, that any step function passed to it will be wrapped and executed in the context of WebDriver
     * Control Flow
     *
     * @param originalStepGenerator
     * @return {StepGenerator}
     */
    function synchronising (originalStepGenerator: StepGenerator): StepGenerator {

        function synchronisingStepGenerator (pattern: string, options: any, code?: SomeFunction) {

            let originalStep = code || options,
                synchronised = mimic(originalStep, synchronisedStep(originalStep));

            let params = !! code
                ? [ pattern, options, synchronised ]
                : [ pattern, synchronised ];

            return originalStepGenerator.apply(cucumber, params);
        }

        return mimic (originalStepGenerator, synchronisingStepGenerator);
    }

    /**
     * Provides a synchronised wrapper around the user-defined step
     *
     * @param originalStep
     * @return {(args:...[any])=>Promise<void>}
     */
    function synchronisedStep (originalStep: SomeFunction) {
        return function (...args: any[]) {

            let deferred = new Deferred<void>(),
                context  = this;

            controlFlow
                .execute(() => originalStep.apply(context, args) )
                .then(deferred.resolve, deferred.reject);

            return deferred.promise;
        };
    }
}

/**
 * Makes the pretender function of the same arity as the original one to deceive cucumber.
 *
 * @param original
 * @param pretender
 * @return {(args:...[any])=>any}
 */
function mimic (original: SomeFunction, pretender: SomeFunction): SomeFunction {
    return withArityOf(original.length, pretender);
}

interface SomeFunction {
    (...args: any[]): any;
}

interface StepGenerator {
    (pattern: string, options: any, code?: any): void;
}
