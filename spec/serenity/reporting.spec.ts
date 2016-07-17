import {
    ActivityFinished,
    ActivityStarts,
    PictureTaken,
    SceneFinished,
    SceneStarts,
} from '../../src/serenity/domain/events';
import { Activity, Outcome, Picture, PictureReceipt, Result, Scene } from '../../src/serenity/domain/model';
import { RehearsalReport } from '../../src/serenity/reporting/scribe';

import expect = require('../expect');

describe('Reporting what happened during the test', () => {

    describe('Rehearsal Report', () => {

        const
            startTime = 1467201010000,
            duration  = 42,
            scene     = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature'),

            sceneStarted     = (s: Scene, timestamp: number)                        => new SceneStarts(s, timestamp),
            activityStarted  = (name: string, timestamp: number)                    => new ActivityStarts(new Activity(name), timestamp),
            activityFinished = (name: string, r: Result, ts: number, e?: Error)     => new ActivityFinished(new Outcome(new Activity(name), r, e), ts),
            sceneFinished    = (s: Scene, r: Result, timestamp: number, e?: Error)  => new SceneFinished(new Outcome(s, r, e), timestamp),
            pictureTaken     = (name: string, path: string, timestamp: number) => new PictureTaken(
                new PictureReceipt(new Activity(name), Promise.resolve(new Picture(path))), timestamp
            );

        function expectedReportWith(overrides: any) {
            let report = {
                name: 'Paying with a default card',
                testSteps: [],
                userStory: {
                    id: 'checkout',
                    storyName: 'Checkout',
                    path: 'features/checkout.feature',
                    // narrative: '\nIn order to make me feel a sense of accomplishment\nAs a forgetful person\nI want to ...',
                    type: 'feature',
                },
                title:       'Paying with a default card',
                description: '',
                tags: [],
                // driver: 'chrome:jane',
                manual:    false,
                startTime: startTime,
                duration:  undefined,
                result:    'SUCCESS',
                testFailureCause: undefined,
            };

            return Object.assign(report, overrides);
        }

        it('contains the story of what happened during the scene', () => {
            let events = [
                sceneStarted(scene, startTime),
                sceneFinished(scene, Result.SUCCESS, startTime + duration),
            ];

            let reports = new RehearsalReport().of(events);

            expect(reports).to.eventually.have.length(1);
            expect(reports).to.eventually.deep.equal([expectedReportWith({
                startTime: startTime,
                duration:  duration,
                result:    Result[Result.SUCCESS],
            })]);
        });

        it('includes the details of what happened during specific activities', () => {
            let events = [
                sceneStarted(scene, startTime),
                activityStarted('Opens a browser', startTime + 1),
                activityFinished('Opens a browser', Result.SUCCESS, startTime + 2),
                sceneFinished(scene, Result.SUCCESS, startTime + 3),
            ];

            let reports = new RehearsalReport().of(events);

            expect(reports).to.eventually.have.length(1);

            expect(reports).to.eventually.deep.equal([expectedReportWith({
                duration:  3,
                testSteps: [{
                    description: 'Opens a browser',
                    startTime:   startTime + 1,
                    duration:    1,
                    result:      'SUCCESS',
                    children:    [],
                    exception:   undefined,
                }],
            })]);

        });

        it('contains pictures', () => {
            let events = [
                sceneStarted(scene, startTime),
                activityStarted('Specifies the default email address', startTime + 1),
                pictureTaken('Specifies the default email address', 'picture1.png', startTime + 1),
                activityFinished('Specifies the default email address', Result.SUCCESS, startTime + 2),
                pictureTaken('Specifies the default email address', 'picture2.png', startTime + 2),
                sceneFinished(scene, Result.SUCCESS, startTime + 3),
            ];

            return new RehearsalReport().of(events).then( (reports) => {
                expect(reports).to.have.length(1);

                expect(reports).to.deep.equal([expectedReportWith({
                    duration:  3,
                    testSteps: [{
                        description: 'Specifies the default email address',
                        startTime:   startTime + 1,
                        duration:    1,
                        result:      'SUCCESS',
                        children:    [],
                        exception:   undefined,
                        screenshots: [
                            { screenshot: 'picture1.png' },
                            { screenshot: 'picture2.png' },
                        ],
                    }],
                })]);
            });
        });

        it('covers multiple activities', () => {
            let events = [
                sceneStarted(scene, startTime),
                activityStarted('Opens a browser', startTime + 1),
                activityFinished('Opens a browser', Result.SUCCESS, startTime + 2),
                activityStarted('Navigates to amazon.com', startTime + 3),
                activityFinished('Navigates to amazon.com', Result.SUCCESS, startTime + 4),
                sceneFinished(scene, Result.SUCCESS, startTime + 5),
            ];

            return new RehearsalReport().of(events).then( reports => {
                expect(reports).to.have.length(1);

                expect(reports).to.deep.equal([expectedReportWith({
                    duration:  5,
                    testSteps: [{
                        description: 'Opens a browser',
                        startTime:   startTime + 1,
                        duration:    1,
                        result:      'SUCCESS',
                        children:    [],
                        exception:   undefined,
                        screenshots: undefined,
                    }, {
                        description: 'Navigates to amazon.com',
                        startTime:   startTime + 3,
                        duration:    1,
                        result:      'SUCCESS',
                        children:    [],
                        exception:   undefined,
                        screenshots: undefined,
                    }],
                })]);
            });
        });

        it('covers activities in detail, including sub-activities', () => {
            let events = [
                sceneStarted(scene, startTime),
                activityStarted('Buys a discounted e-book reader', startTime + 1),
                activityStarted('Opens a browser', startTime + 2),
                activityFinished('Opens a browser', Result.SUCCESS, startTime + 3),
                activityStarted('Searches for discounted e-book readers', startTime + 4),
                activityStarted('Navigates to amazon.com', startTime + 5),
                activityFinished('Navigates to amazon.com', Result.SUCCESS, startTime + 6),
                activityFinished('Searches for discounted e-book readers', Result.SUCCESS, startTime + 7),
                activityFinished('Buys a discounted e-book reader', Result.SUCCESS, startTime + 8),
                sceneFinished(scene, Result.SUCCESS, startTime + 9),
            ];

            return new RehearsalReport().of(events).then( reports => {
                expect(reports).to.have.length(1);

                expect(reports).to.deep.equal([expectedReportWith({
                    duration:  9,
                    testSteps: [{
                        description: 'Buys a discounted e-book reader',
                        startTime:   startTime + 1,
                        duration:    7,
                        result:      'SUCCESS',
                        exception:   undefined,
                        screenshots: undefined,
                        children: [{
                            description: 'Opens a browser',
                            startTime:   startTime + 2,
                            duration:    1,
                            result:      'SUCCESS',
                            children:    [],
                            exception:   undefined,
                            screenshots: undefined,
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
                                exception:   undefined,
                                screenshots: undefined,
                            }],
                            exception:   undefined,
                            screenshots: undefined,
                        }],
                    }],
                })]);
            });
        });

        it('describes problems encountered', () => {
            let error = new Error("We're sorry, something happened");

            error.stack = [
            "Error: We're sorry, something happened",
            '    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)',
            '    at Test.Runnable.run (/fake/path/node_modules/mocha/lib/runnable.js:319:7)',
                // and so on
            ].join('\n');

            let events = [
                sceneStarted(scene, startTime),
                activityStarted('Buys a discounted e-book reader', startTime + 1),
                activityFinished('Buys a discounted e-book reader', Result.ERROR, startTime + 2, error),
                sceneFinished(scene, Result.ERROR, startTime + 3, error),
            ];

            return new RehearsalReport().of(events).then( reports => {
                expect(reports).to.deep.equal([expectedReportWith({
                    duration:  3,
                    testSteps: [{
                        description: 'Buys a discounted e-book reader',
                        startTime:   startTime + 1,
                        duration:    1,
                        result:      'ERROR',
                        children:   [],
                        screenshots: undefined,
                        exception: {
                            errorType: 'Error',
                            message: "We're sorry, something happened",
                            stackTrace: [{
                                declaringClass: 'Object',
                                fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                lineNumber: 326,
                                methodName: 'callFn',
                            }, {
                                declaringClass: 'Test',
                                fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                lineNumber: 319,
                                methodName: 'Runnable.run',
                            }],
                        },
                    }],
                    result: 'ERROR',
                    testFailureCause: {
                        errorType: 'Error',
                        message: "We're sorry, something happened",
                        stackTrace: [{
                            declaringClass: 'Object',
                            fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                            lineNumber: 326,
                            methodName: 'callFn',
                        }, {
                            declaringClass: 'Test',
                            fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                            lineNumber: 319,
                            methodName: 'Runnable.run',
                        }],
                    },
                })]);
            });
        });
    });
});
