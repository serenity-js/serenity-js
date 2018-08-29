import { UnknownError } from '@serenity-js/core/lib/errors';
import { ErrorSerialiser, Path } from '@serenity-js/core/lib/io';
import {
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';

import { AmbiguousStepDefinitionError } from '../errors';
import { Feature, ScenarioOutline } from '../gherkin';
import { Scenario } from '../gherkin/model';
import { CucumberFormatterOptions } from './CucumberFormatterOptions';
import { Dependencies } from './Dependencies';

import { ensure, isDefined } from 'tiny-types';

export function cucumberEventProtocolAdapter({ notifier, mapper, cache }: Dependencies) {
    return class CucumberEventProtocolAdapter {

        // note: exported class expression can't have private properties
        public readonly log: any;

        constructor({ eventBroadcaster, log }: CucumberFormatterOptions) {
            this.log = log;

            eventBroadcaster.on('gherkin-document', ({ uri, document }) => {
                ensure('gherkin-document :: uri', uri, isDefined());
                ensure('gherkin-document :: document', document, isDefined());

                const path = new Path(uri);
                cache.set(path, mapper.map(document, path));
            });

            eventBroadcaster.on('test-case-started', ({ sourceLocation }) => {
                ensure('test-case-started :: sourceLocation', sourceLocation, isDefined());

                const
                    map = cache.get(new Path(sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(sourceLocation.line);

                if (!! scenario.outline) {
                    const outline = map.get(ScenarioOutline).onLine(scenario.outline.line);
                    notifier.outlineDetected(scenario, outline, map.getFirst(Feature));
                }

                notifier.scenarioStarts(scenario, map.getFirst(Feature));
            });

            eventBroadcaster.on('test-step-started', ({ index, testCase }) => {

                ensure('test-step-started :: index', index, isDefined());
                ensure('test-step-started :: testCase', testCase, isDefined());

                const
                    map      = cache.get(new Path(testCase.sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(testCase.sourceLocation.line),
                    step     = scenario.steps[index];

                if (!! step) {
                    notifier.stepStarts(step);
                }
            });

            eventBroadcaster.on('test-step-finished', ({ index, result, testCase }) => {

                ensure('test-step-finished :: index', index, isDefined());
                ensure('test-step-finished :: result', result, isDefined());
                ensure('test-step-finished :: testCase', testCase, isDefined());

                const
                    map      = cache.get(new Path(testCase.sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(testCase.sourceLocation.line),
                    step     = scenario.steps[index];

                if (!! step) {
                    notifier.stepFinished(step, this.outcomeFrom(result));
                }
            });

            eventBroadcaster.on('test-case-finished', ({ result, sourceLocation }) => {

                ensure('test-case-finished :: result', result, isDefined());
                ensure('test-case-finished :: sourceLocation', sourceLocation, isDefined());

                const
                    map      = cache.get(new Path(sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(sourceLocation.line);

                notifier.scenarioFinished(scenario, map.getFirst(Feature), this.outcomeFrom(result));
            });
        }

        outcomeFrom(result: { duration: number, exception: string | Error, status: string }): Outcome {
            const error = !! result.exception && this.errorFrom(result.exception);

            // tslint:disable:switch-default
            switch (result.status) {
                case 'undefined':
                    return new ImplementationPending();

                case 'ambiguous':
                case 'failed':
                    return new ExecutionFailedWithError(error);

                case 'pending':
                    return new ImplementationPending();

                case 'passed':
                    return new ExecutionSuccessful();

                case 'skipped':
                    return new ExecutionSkipped();
            }
            // tslint:enable:switch-default
        }

        errorFrom(exception: Error | string) {
            if (exception instanceof Error) {
                return exception;
            }

            if (typeof exception === 'string') {
                switch (true) {
                    case exception.startsWith('Multiple step definitions match'):
                        return new AmbiguousStepDefinitionError(exception);
                    default:
                        return ErrorSerialiser.deserialiseFromStackTrace(exception);
                }
            }

            const message = `Cucumber has reported the following error, which Serenity/JS didn't recognise: "${ exception }"`;
            this.log(message, exception);

            return new UnknownError(message);
        }
    };
}
