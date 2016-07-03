import * as chai from "chai";
import {ScenarioStarted, ScenarioCompleted, StepStarted, StepCompleted} from "../../lib/serenity/domain/events";
import {Scenario, Outcome, Result, Step} from "../../lib/serenity/domain/model";
import {SerenityReporter} from "../../lib/serenity/reporting/scribe";
import timeout = Q.timeout;

const expect = chai.expect;

chai.use(require("sinon-chai"));

describe('Reporting what happened during the test', () => {

    describe('SerenityReporter', () => {

        const
            startTime = 1467201010000,
            duration  = 42,
            scenario  = new Scenario('Paying with a default card', 'Checkout', 'features/checkout.feature'),

            scenarioStarted   = (scenario: Scenario, timestamp: number)                       => new ScenarioStarted(scenario, timestamp),
            stepStarted       = (name: string, timestamp: number)                             => new StepStarted(new Step(name), timestamp),
            stepCompleted     = (name: string, r: Result, timestamp: number, e?: Error)       => new StepCompleted(new Outcome(new Step(name), r, e), timestamp),
            scenarioCompleted = (scenario: Scenario, r: Result, timestamp: number, e?: Error) => new ScenarioCompleted(new Outcome(scenario, r, e), timestamp);

        function expectedReportWith(overrides: any) {
            let report = {
                name: "Paying with a default card",
                testSteps: [],
                userStory: {
                    id: "checkout",
                    storyName: "Checkout",
                    path: "features/checkout.feature",
                    // narrative: "\nIn order to make me feel a sense of accomplishment\nAs a forgetful person\nI want to be to view all of things I have completed",
                    type: "feature"
                },
                title:       "Paying with a default card",
                description: "",
                tags: [],
                // driver: "chrome:jane",
                manual:    false,
                startTime: startTime,
                duration:  undefined,
                result:    'SUCCESS',
                testFailureCause: undefined
            };

            return Object.assign(report, overrides);
        }


        it('reports the basic story of what happened', () => {
            let events = [
                scenarioStarted(scenario, startTime),
                scenarioCompleted(scenario, Result.SUCCESS, startTime + duration)
            ];

            let reports = new SerenityReporter().reportOn(events);

            expect(reports).to.have.length(1);
            expect(reports.pop()).to.deep.equal(expectedReportWith({
                startTime: startTime,
                duration:  duration,
                result:    Result[Result.SUCCESS]
            }));
        });

        it('reports a more detailed story of what happened', () => {
            let events = [
                scenarioStarted(scenario, startTime),
                stepStarted("Opens a browser", startTime + 1),
                stepCompleted("Opens a browser", Result.SUCCESS, startTime + 2),
                scenarioCompleted(scenario, Result.SUCCESS, startTime + 3)
            ];

            let reports = new SerenityReporter().reportOn(events);

            expect(reports).to.have.length(1);

            expect(reports.pop()).to.deep.equal(expectedReportWith({
                duration:  3,
                testSteps: [{
                    description: 'Opens a browser',
                    startTime:   startTime + 1,
                    duration:    1,
                    result:      'SUCCESS',
                    children:    [],
                    exception:   undefined
                }]
            }));

        });

        it('reports stories involving multiple steps', () => {
            let events = [
                scenarioStarted(scenario, startTime),
                stepStarted("Opens a browser", startTime + 1),
                stepCompleted("Opens a browser", Result.SUCCESS, startTime + 2),
                stepStarted("Navigates to amazon.com", startTime + 3),
                stepCompleted("Navigates to amazon.com", Result.SUCCESS, startTime + 4),
                scenarioCompleted(scenario, Result.SUCCESS, startTime + 5)
            ];

            let reports = new SerenityReporter().reportOn(events);

            expect(reports).to.have.length(1);

            expect(reports.pop()).to.deep.equal(expectedReportWith({
                duration:  5,
                testSteps: [{
                    description: 'Opens a browser',
                    startTime:   startTime + 1,
                    duration:    1,
                    result:      'SUCCESS',
                    children:    [],
                    exception:   undefined
                }, {
                    description: 'Navigates to amazon.com',
                    startTime:   startTime + 3,
                    duration:    1,
                    result:      'SUCCESS',
                    children:    [],
                    exception:   undefined
                }]
            }));

        });

        it('reports stories involving nested steps', () => {
            let events = [
                scenarioStarted(scenario, startTime),
                stepStarted("Buys a discounted e-book reader", startTime + 1),
                stepStarted("Opens a browser", startTime + 2),
                stepCompleted("Opens a browser", Result.SUCCESS, startTime + 3),
                stepStarted("Searches for discounted e-book readers", startTime + 4),
                stepStarted("Navigates to amazon.com", startTime + 5),
                stepCompleted("Navigates to amazon.com", Result.SUCCESS, startTime + 6),
                stepCompleted("Searches for discounted e-book readers", Result.SUCCESS, startTime + 7),
                stepCompleted("Buys a discounted e-book reader", Result.SUCCESS, startTime + 8),
                scenarioCompleted(scenario, Result.SUCCESS, startTime + 9)
            ];

            let reports = new SerenityReporter().reportOn(events);

            expect(reports).to.have.length(1);

            expect(reports.pop()).to.deep.equal(expectedReportWith({
                duration:  9,
                testSteps: [{
                    description: 'Buys a discounted e-book reader',
                    startTime:   startTime + 1,
                    duration:    7,
                    result:      'SUCCESS',
                    exception:   undefined,
                    children: [{
                        description: 'Opens a browser',
                        startTime:   startTime + 2,
                        duration:    1,
                        result:      'SUCCESS',
                        children:    [],
                        exception:   undefined
                    }, {
                        description: 'Searches for discounted e-book readers',
                        startTime:   startTime + 4,
                        duration:    3,
                        result:      'SUCCESS',
                        children: [{
                            description: 'Navigates to amazon.com',
                            startTime:   startTime + 5,
                            duration:    1,
                            result:      'SUCCESS',
                            children:    [],
                            exception:   undefined
                        }],
                        exception:   undefined
                    }]
                }]
            }));
        });

        it('reports problems', () => {
            let error = new Error("We're sorry, something happened");

            error.stack = [
            "Error: We're sorry, something happened",
            "    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)",
            "    at Test.Runnable.run (/fake/path/node_modules/mocha/lib/runnable.js:319:7)",
                // and so on
            ].join('\n');


            let events = [
                scenarioStarted(scenario, startTime),
                stepStarted("Buys a discounted e-book reader", startTime + 1),
                stepCompleted("Buys a discounted e-book reader", Result.ERROR, startTime + 2, error),
                scenarioCompleted(scenario, Result.ERROR, startTime + 3, error)
            ];

            let reports = new SerenityReporter().reportOn(events);

            expect(reports.pop()).to.deep.equal(expectedReportWith({
                duration:  3,
                testSteps: [{
                    description: 'Buys a discounted e-book reader',
                    startTime:   startTime + 1,
                    duration:    1,
                    result:      'ERROR',
                    children:   [],
                    exception: {
                        errorType: "Error",
                        message: "We're sorry, something happened",
                        stackTrace: [{
                            declaringClass: "Object",
                            fileName: "/fake/path/node_modules/mocha/lib/runnable.js",
                            lineNumber: 326,
                            methodName: "callFn",
                        }, {
                            declaringClass: "Test",
                            fileName: "/fake/path/node_modules/mocha/lib/runnable.js",
                            lineNumber: 319,
                            methodName: "Runnable.run",
                        }]
                    },
                }],
                result: 'ERROR',
                testFailureCause: {
                    errorType: "Error",
                    message: "We're sorry, something happened",
                    stackTrace: [{
                        declaringClass: "Object",
                        fileName: "/fake/path/node_modules/mocha/lib/runnable.js",
                        lineNumber: 326,
                        methodName: "callFn",
                    }, {
                        declaringClass: "Test",
                        fileName: "/fake/path/node_modules/mocha/lib/runnable.js",
                        lineNumber: 319,
                        methodName: "Runnable.run",
                    }]
                }
            }))
        });
    });
});