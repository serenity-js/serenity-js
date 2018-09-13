import { serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import {
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';

import { AmbiguousStepDefinitionError } from '../errors';
import { Feature, FeatureFileMap, Scenario, ScenarioOutline, Step } from '../gherkin';
import { Dependencies } from './Dependencies';

export = function({ notifier, loader, cache }: Dependencies) {
    return function() {
        this.registerHandler('BeforeFeature', function(feature, callback) {
            loader.load(get(feature, 'uri').as(Path)).then(_ => callback(), error => callback(error));
        });

        this.registerHandler('BeforeScenario', function(scenario) {
            const
                path  = get(scenario, 'uri').as(Path),
                line  = get(scenario, 'line').value() as number,
                lines = get(scenario, 'lines').value() as number[],
                isOutline = lines.length === 2;

            const map = cache.get(path);

            if (isOutline) {
                notifier.outlineDetected(map.get(Scenario).onLine(line), map.get(ScenarioOutline).onLine(lines[ 1 ]), map.getFirst(Feature));
            }

            notifier.scenarioStarts(map.get(Scenario).onLine(line), map.getFirst(Feature));
        });

        this.registerHandler('BeforeStep', function(step) {
            if (shouldIgnore(step)) {
                return void 0;
            }

            const
                scenario = get(step, 'scenario').value(),
                path     = get(scenario, 'uri').as(Path);

            notifier.stepStarts(findStepMatching(step, cache.get(path)));
        });

        this.registerHandler('StepResult', function(result) {
            const
                step     = get(result, 'step').value(),
                scenario = get(step, 'scenario').value(),
                path     = get(scenario, 'uri').as(Path);

            if (shouldIgnore(step)) {
                return void 0;
            }

            notifier.stepFinished(findStepMatching(step, cache.get(path)), stepOutcomeFrom(result));
        });

        this.registerHandler('ScenarioResult', function(result) {

            const
                scenario = get(result, 'scenario').value(),
                path     = get(scenario, 'uri').as(Path),
                line     = get(scenario, 'line').value() as number;

            const map = cache.get(path);

            notifier.scenarioFinished(map.get(Scenario).onLine(line), map.getFirst(Feature), scenarioOutcomeFrom(result));
        });

        this.registerHandler('AfterScenario', function(scenario, callback) {
            serenity.stageManager.waitForNextCue()
                .then(() => callback(), error => callback(error));
        });

        this.registerHandler('AfterFeatures', (features, callback) => {
            notifier.testRunFinished();

            serenity.stageManager.waitForNextCue()
                .then(() => callback(), error => callback(error));
        });
    };
};

function get(object, property) {
    const getter = 'get' + property.charAt(0).toUpperCase() + property.slice(1);

    const value = object[getter]
        ? object[getter]()
        : object[property];

    return ({
        as: function<T>(type: { new (v: any): T}): T {  // tslint:disable-line:object-literal-shorthand esdoc doesn't understand generic anonymous functions
            return new type(value);
        },
        value: () => value,
    });
}

function is(object, property): boolean {
    const getter = 'is' + property.charAt(0).toUpperCase() + property.slice(1);
    return object[getter] ? object[getter]() : object[getter];
}

function findStepMatching(step, map: FeatureFileMap): Step {
    const
        stepLine     = get(step, 'line').value() as number,
        scenario     = get(step, 'scenario').value(),
        path         = get(scenario, 'uri').as(Path),
        scenarioLine = get(scenario, 'line').value() as number;

    const matchedStep = map.get(Scenario).onLine(scenarioLine).steps.find(s => s.location.line === stepLine);

    if (! matchedStep) {
        throw new Error(`No step was found in ${ path } on line ${ stepLine }. This looks like a bug.`);
    }

    return matchedStep;
}

function scenarioOutcomeFrom(result): Outcome {
    const
        status: string = get(result, 'status').value(),
        error: Error   = errorFrom(get(result, 'failureException').value());

    return outcomeFrom(status, error);
}

function stepOutcomeFrom(result): Outcome {
    const
        status: string                          = get(result, 'status').value(),
        ambiguousStepsError: Error | undefined  = ambiguousStepsDetectedIn(result),
        error: Error | undefined                = errorFrom(get(result, 'failureException').value());

    return outcomeFrom(status, error || ambiguousStepsError);
}

function ambiguousStepsDetectedIn(result): Error | undefined {
    const ambiguousStepDefinitions = get(result, 'ambiguousStepDefinitions').value() || [];

    if (ambiguousStepDefinitions.length === 0) {
        return void 0;
    }

    return ambiguousStepDefinitions
        .map(step => `${ get(step, 'pattern').value().toString() } - ${ get(step, 'uri').value() }:${ get(step, 'line').value() }`)
        .reduce((err: Error, issue) => {
            err.message += `\n${issue}`;
            return err;
        }, new AmbiguousStepDefinitionError('Multiple step definitions match:'));
}

function errorFrom(error: Error | string | undefined): Error | undefined {
    switch (typeof error) {
        case 'string':   return new Error(error as string);
        case 'object':   return error as Error;
        case 'function': return error as Error;
        default:         return void 0;
    }
}

function outcomeFrom(status: string, error?: Error) {
    if (error && /timed out/.test(error.message)) {
        return new ExecutionFailedWithError(error);
    }

    // tslint:disable:switch-default
    switch (true) {
        case status === 'undefined':
            return new ImplementationPending();

        case status === 'ambiguous':
            if (! error) {
                // Only the step result contains the "ambiguous step def error", the scenario itself doesn't
                return new ExecutionFailedWithError(new AmbiguousStepDefinitionError('Multiple step definitions match'));
            }

            return new ExecutionFailedWithError(error);

        case status === 'failed':
            return new ExecutionFailedWithError(error);

        case status === 'pending':
            return new ImplementationPending();

        case status === 'passed':
            return new ExecutionSuccessful();

        case status === 'skipped':
            return new ExecutionSkipped();
    }
    // tslint:enable:switch-default
}

function shouldIgnore(step): boolean {
    return is(step, 'hidden')                                       // cucumber 0-1
        || (step.constructor && step.constructor.name === 'Hook');  // cucumber 2
}
