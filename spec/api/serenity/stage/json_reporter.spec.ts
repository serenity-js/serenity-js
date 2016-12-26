import * as fs from 'fs';
import * as mockfs from 'mock-fs';
import { Md5 } from 'ts-md5/dist/md5';

import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Photo,
    PhotoAttempted,
    PhotoReceipt,
    Result,
    Scene,
    SceneFinished,
    SceneStarts,
    Tag,
} from '../../../../src/serenity/domain';
import { FileSystem } from '../../../../src/serenity/io/file_system';
import { Journal, JsonReporter, Stage, StageManager } from '../../../../src/serenity/stage';
import { jsonReporter } from '../../../../src/stage_crew';

import expect = require('../../../expect');

describe('When reporting on what happened during the rehearsal', () => {

    describe ('JSON Reporter', () => {

        const
            startTime = 1467201010000,
            duration  = 42,
            scene     = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature'),
            sceneId   = Md5.hashStr(scene.id),
            filename  = `${ sceneId }.json`,
            rootDir   = '/some/path/to/reports';

        let stageManager: StageManager,
            stage: Stage,
            fileSystem: FileSystem,
            reporter: JsonReporter;

        beforeEach( () => {
            fileSystem   = new FileSystem(rootDir);
            stageManager = new StageManager(new Journal());
            stage        = new Stage(stageManager);

            reporter = new JsonReporter(fileSystem);
            reporter.assignTo(stage);
        });

        beforeEach(() => mockfs({ '/Users/jan/projects/serenityjs': {} }));
        afterEach (() => mockfs.restore());

        it ('can be instantiated using a default path to the reports directory', () => {
            expect(jsonReporter()).to.be.instanceOf(JsonReporter);
        });

        it ('can be instantiated using a factory method so that explicit instantiation of the File System can be avoided', () => {
            expect(jsonReporter('/some/path/to/reports')).to.be.instanceOf(JsonReporter);
        });

        describe ('the Rehearsal Report', () => {

            it('contains the story of what happened during a scene', () => {
                givenFollowingEvents(
                    sceneStarted(scene, startTime),
                    sceneFinished(scene, Result.SUCCESS, startTime + duration),
                );

                return stageManager.allDone().then(_ =>
                    expect(producedReport()).to.deep.equal(expectedReportWith({
                        startTime,
                        duration,
                        result:    Result[Result.SUCCESS],
                    })));
            });

            it('includes the details of what happened during specific activities', () => {
                givenFollowingEvents(
                    sceneStarted(scene, startTime),
                    activityStarted('Opens a browser', startTime + 1),
                    activityFinished('Opens a browser', Result.SUCCESS, startTime + 2),
                    sceneFinished(scene, Result.SUCCESS, startTime + 3),
                );

                return stageManager.allDone().then(_ =>
                    expect(producedReport()).to.deep.equal(expectedReportWith({
                        duration: 3,
                        testSteps: [ {
                            description: 'Opens a browser',
                            startTime:   startTime + 1,
                            duration:    1,
                            result:      'SUCCESS',
                            children:    [],
                        } ],
                    })));
            });

            it('covers multiple activities', () => {
                givenFollowingEvents(
                    sceneStarted(scene, startTime),
                    activityStarted('Opens a browser', startTime + 1),
                    activityFinished('Opens a browser', Result.SUCCESS, startTime + 2),
                    activityStarted('Navigates to amazon.com', startTime + 3),
                    activityFinished('Navigates to amazon.com', Result.SUCCESS, startTime + 4),
                    sceneFinished(scene, Result.SUCCESS, startTime + 5),
                );

                return stageManager.allDone().then(_ =>
                    expect(producedReport()).to.deep.equal(expectedReportWith({
                        duration: 5,
                        testSteps: [ {
                            description: 'Opens a browser',
                            startTime: startTime + 1,
                            duration: 1,
                            result: 'SUCCESS',
                            children: [],
                        }, {
                            description: 'Navigates to amazon.com',
                            startTime: startTime + 3,
                            duration: 1,
                            result: 'SUCCESS',
                            children: [],
                        } ],
                    })));
            });

            it('covers activities in detail, including sub-activities', () => {
                givenFollowingEvents(
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
                );

                return stageManager.allDone().then(_ =>
                    expect(producedReport()).to.deep.equal(expectedReportWith({
                        duration: 9,
                        testSteps: [ {
                            description: 'Buys a discounted e-book reader',
                            startTime: startTime + 1,
                            duration: 7,
                            result: 'SUCCESS',
                            children: [ {
                                description: 'Opens a browser',
                                startTime: startTime + 2,
                                duration: 1,
                                result: 'SUCCESS',
                                children: [],
                            }, {
                                description: 'Searches for discounted e-book readers',
                                startTime: startTime + 4,
                                duration: 3,
                                result: 'SUCCESS',
                                children: [ {
                                    description: 'Navigates to amazon.com',
                                    startTime: startTime + 5,
                                    duration: 1,
                                    result: 'SUCCESS',
                                    children: [],
                                } ],
                            } ],
                        } ],
                    })));
            });

            describe('When working with photos', () => {

                it('contains pictures', () => {
                    givenFollowingEvents(
                        sceneStarted(scene, startTime),
                        activityStarted('Specifies the default email address', startTime + 1),
                        photoTaken('Specifies the default email address', 'picture1.png', startTime + 1),
                        activityFinished('Specifies the default email address', Result.SUCCESS, startTime + 2),
                        photoTaken('Specifies the default email address', 'picture2.png', startTime + 2),
                        sceneFinished(scene, Result.SUCCESS, startTime + 3),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 3,
                            testSteps: [ {
                                description: 'Specifies the default email address',
                                startTime: startTime + 1,
                                duration: 1,
                                result: 'SUCCESS',
                                children: [],
                                screenshots: [
                                    { screenshot: 'picture1.png' },
                                    { screenshot: 'picture2.png' },
                                ],
                            } ],
                        })));
                });

                it('ignores the photos that have been attempted but failed (ie. because webdriver was not ready)', () => {

                    givenFollowingEvents(
                        sceneStarted(scene, startTime),
                        activityStarted('Buys a discounted e-book reader', startTime + 1),
                        activityFinished('Buys a discounted e-book reader', Result.SUCCESS, startTime + 2),
                        photoFailed('Buys a discounted e-book reader', startTime + 2),
                        sceneFinished(scene, Result.SUCCESS, startTime + 3),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 3,
                            testSteps: [ {
                                description: 'Buys a discounted e-book reader',
                                startTime: startTime + 1,
                                duration: 1,
                                result: 'SUCCESS',
                                children: [],
                            } ],
                        })));
                });

                it('covers activities in detail, including photos for sub-activities', () => {
                    givenFollowingEvents(
                        sceneStarted(scene, startTime),                                                                 // current: scene
                            activityStarted('Buys a discounted e-book reader', startTime + 1),                          // current: buys,   previous: scene
                                activityStarted('Opens a browser', startTime + 2),                                      // current: opens,  previous: buys
                                activityFinished('Opens a browser', Result.SUCCESS, startTime + 3),                     // current: buys,   previous: _
                                photoTaken('Opens a browser', 'opens_browser.png', startTime + 3),                      // current: opens,  previous:
                                activityStarted('Searches for discounted e-book readers', startTime + 4),
                                    activityStarted('Navigates to amazon.com', startTime + 5),
                                    activityFinished('Navigates to amazon.com', Result.SUCCESS, startTime + 6),
                                    photoTaken('Navigates to amazon.com', 'navigates.png', startTime + 6),
                                activityFinished('Searches for discounted e-book readers', Result.SUCCESS, startTime + 7),
                                photoTaken('Searches for discounted e-book readers', 'searches.png', startTime + 7),
                            activityFinished('Buys a discounted e-book reader', Result.SUCCESS, startTime + 8),
                            photoTaken('Buys a discounted e-book reader', 'buys.png', startTime + 8),
                        sceneFinished(scene, Result.SUCCESS, startTime + 9),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 9,
                            testSteps: [ {
                                description: 'Buys a discounted e-book reader',
                                startTime: startTime + 1,
                                duration: 7,
                                result: 'SUCCESS',
                                screenshots: [
                                    { screenshot: 'buys.png' },
                                ],
                                children: [ {
                                    description: 'Opens a browser',
                                    startTime: startTime + 2,
                                    duration: 1,
                                    result: 'SUCCESS',
                                    children: [],
                                    screenshots: [
                                        { screenshot: 'opens_browser.png' },
                                    ],
                                }, {
                                    description: 'Searches for discounted e-book readers',
                                    startTime: startTime + 4,
                                    duration: 3,
                                    result: 'SUCCESS',
                                    children: [ {
                                        description: 'Navigates to amazon.com',
                                        startTime: startTime + 5,
                                        duration: 1,
                                        result: 'SUCCESS',
                                        children: [],
                                        screenshots: [
                                            { screenshot: 'navigates.png' },
                                        ],
                                    } ],
                                    screenshots: [
                                        { screenshot: 'searches.png' },
                                    ],
                                } ],
                            } ],
                        })));
                });

                it('covers activities in detail, including photos for sub-activities, even those deeply nested ones', () => {
                    givenFollowingEvents(
                        sceneStarted(scene, startTime),
                            activityStarted('Buys a discounted e-book reader', startTime + 1),
                                activityStarted('Searches for discounted e-book readers', startTime + 4),
                                    activityStarted('Navigates to amazon.com', startTime + 5),
                                        activityStarted('Enters https://amazon.com in the search bar', startTime + 5),
                                        activityFinished('Enters https://amazon.com in the search bar', Result.SUCCESS, startTime + 6),
                                        photoTaken('Enters https://amazon.com in the search bar', 'enters_url.png', startTime + 6),
                                    activityFinished('Navigates to amazon.com', Result.SUCCESS, startTime + 7),
                                    photoTaken('Navigates to amazon.com', 'navigates.png', startTime + 7),
                                activityFinished('Searches for discounted e-book readers', Result.SUCCESS, startTime + 8),
                                photoTaken('Searches for discounted e-book readers', 'searches.png', startTime + 8),
                            activityFinished('Buys a discounted e-book reader', Result.SUCCESS, startTime + 9),
                            photoTaken('Buys a discounted e-book reader', 'buys.png', startTime + 9),
                        sceneFinished(scene, Result.SUCCESS, startTime + 10),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 10,
                            testSteps: [ {
                                description: 'Buys a discounted e-book reader',
                                startTime: startTime + 1,
                                duration: 8,
                                result: 'SUCCESS',
                                screenshots: [
                                    { screenshot: 'buys.png' },
                                ],
                                children: [ {
                                    description: 'Searches for discounted e-book readers',
                                    startTime: startTime + 4,
                                    duration: 4,
                                    result: 'SUCCESS',
                                    children: [ {
                                        description: 'Navigates to amazon.com',
                                        startTime: startTime + 5,
                                        duration: 2,
                                        result: 'SUCCESS',
                                        children: [{
                                            description: 'Enters https://amazon.com in the search bar',
                                            startTime: startTime + 5,
                                            duration: 1,
                                            result: 'SUCCESS',
                                            children: [],
                                            screenshots: [
                                                { screenshot: 'enters_url.png' },
                                            ],
                                        }],
                                        screenshots: [
                                            { screenshot: 'navigates.png' },
                                        ],
                                    } ],
                                    screenshots: [
                                        { screenshot: 'searches.png' },
                                    ],
                                } ],
                            } ],
                        })));
                });
            });

            describe('When problems are encountered', () => {

                it('describes problems encountered', () => {
                    let error = new Error("We're sorry, something happened");

                    error.stack = [
                        "Error: We're sorry, something happened",
                        '    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)',
                        '    at Test.Runnable.run (/fake/path/node_modules/mocha/lib/runnable.js:319:7)',
                        // and so on
                    ].join('\n');

                    givenFollowingEvents(
                        sceneStarted(scene, startTime),
                        activityStarted('Buys a discounted e-book reader', startTime + 1),
                        activityFinished('Buys a discounted e-book reader', Result.ERROR, startTime + 2, error),
                        sceneFinished(scene, Result.ERROR, startTime + 3, error),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 3,
                            testSteps: [ {
                                description: 'Buys a discounted e-book reader',
                                startTime: startTime + 1,
                                duration: 1,
                                result: 'ERROR',
                                children: [],
                                exception: {
                                    errorType: 'Error',
                                    message: "We're sorry, something happened",
                                    stackTrace: [ {
                                        declaringClass: 'Object',
                                        fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                        lineNumber: 326,
                                        methodName: 'callFn',
                                    }, {
                                        declaringClass: 'Test',
                                        fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                        lineNumber: 319,
                                        methodName: 'Runnable.run',
                                    } ],
                                },
                            } ],
                            result: 'ERROR',
                            testFailureCause: {
                                errorType: 'Error',
                                message: "We're sorry, something happened",
                                stackTrace: [ {
                                    declaringClass: 'Object',
                                    fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                    lineNumber: 326,
                                    methodName: 'callFn',
                                }, {
                                    declaringClass: 'Test',
                                    fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                                    lineNumber: 319,
                                    methodName: 'Runnable.run',
                                } ],
                            },
                        })));
                });

            });

            describe('When scenarios are tagged', () => {

                it('adds a tag for the feature covered', () => {
                    let aScene = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature');

                    givenFollowingEvents(
                        sceneStarted(aScene, startTime),
                        sceneFinished(aScene, Result.SUCCESS, startTime + 1),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 1,
                            result: 'SUCCESS',
                            tags: [ {
                                name: 'Checkout',
                                type: 'feature',
                            } ],
                        })));
                });

                it('describes the simple tags encountered', () => {
                    let taggedScene = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature', [
                        new Tag('regression'),
                    ]);

                    givenFollowingEvents(
                        sceneStarted(taggedScene, startTime),
                        sceneFinished(taggedScene, Result.SUCCESS, startTime + 1),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 1,
                            result: 'SUCCESS',
                            tags: [{
                                name: 'regression',
                                type: 'tag',
                            }, {
                                name: 'Checkout',
                                type: 'feature',
                            }],
                        })));
                });

                it('describes the complex tags encountered', () => {
                    let taggedScene = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature', [
                        new Tag('priority', [ 'must-have' ]),
                    ]);

                    givenFollowingEvents(
                        sceneStarted(taggedScene, startTime),
                        sceneFinished(taggedScene, Result.SUCCESS, startTime + 1),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 1,
                            result: 'SUCCESS',
                            tags: [{
                                name: 'must-have',
                                type: 'priority',
                            }, {
                                name: 'Checkout',
                                type: 'feature',
                            }],
                        })));
                });

                it('extracts the value of any @issues tags encountered and breaks them down to one tag per issue', () => {
                    let taggedScene = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature', [
                        new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-456' ]),
                        new Tag('issues', [ 'MY-PROJECT-789' ]),
                    ]);

                    givenFollowingEvents(
                        sceneStarted(taggedScene, startTime),
                        sceneFinished(taggedScene, Result.SUCCESS, startTime + 1),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 1,
                            result: 'SUCCESS',
                            tags: [{
                                name: 'MY-PROJECT-123',
                                type: 'issue',
                            }, {
                                name: 'MY-PROJECT-456',
                                type: 'issue',
                            }, {
                                name: 'MY-PROJECT-789',
                                type: 'issue',
                            }, {
                                name: 'Checkout',
                                type: 'feature',
                            }],
                            issues: [
                                'MY-PROJECT-123',
                                'MY-PROJECT-456',
                                'MY-PROJECT-789',
                            ],
                        })));
                });

                it('ensures that the extracted issue ids are unique', () => {
                    let taggedScene = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature', [
                        new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-456' ]),
                        new Tag('issue',  [ 'MY-PROJECT-123' ]),
                    ]);

                    givenFollowingEvents(
                        sceneStarted(taggedScene, startTime),
                        sceneFinished(taggedScene, Result.SUCCESS, startTime + 1),
                    );

                    return stageManager.allDone().then(_ =>
                        expect(producedReport()).to.deep.equal(expectedReportWith({
                            duration: 1,
                            result: 'SUCCESS',
                            tags: [{
                                name: 'MY-PROJECT-123',
                                type: 'issue',
                            }, {
                                name: 'MY-PROJECT-456',
                                type: 'issue',
                            }, {
                                name: 'Checkout',
                                type: 'feature',
                            }],
                            issues: [
                                'MY-PROJECT-123',
                                'MY-PROJECT-456',
                            ],
                        })));
                });
            });

            function givenFollowingEvents(...events: Array<DomainEvent<any>>) {
                events.forEach(event => stage.manager.notifyOf(event));
            }

            function sceneStarted(s: Scene, timestamp: number) {
                return new SceneStarts(s, timestamp);
            }

            function activityStarted(name: string, timestamp: number) {
                return new ActivityStarts(new Activity(name), timestamp);
            }

            function activityFinished(name: string, r: Result, ts: number, e?: Error) {
                return new ActivityFinished(new Outcome(new Activity(name), r, e), ts);
            }

            function sceneFinished(s: Scene, r: Result, timestamp: number, e?: Error) {
                return new SceneFinished(new Outcome(s, r, e), timestamp);
            }

            function photoTaken(name: string, path: string, timestamp: number) {
                return new PhotoAttempted(new PhotoReceipt(new Activity(name), Promise.resolve(new Photo(path))), timestamp);
            }

            function photoFailed(name, timestamp) {
                return new PhotoAttempted(new PhotoReceipt(new Activity(name), Promise.resolve(undefined)), timestamp);
            }

            function expectedReportWith(overrides: any) {
                let report = {
                    name: 'Paying with a default card',
                    testSteps: [],
                    issues: [],
                    userStory: {
                        id: 'checkout',
                        storyName: 'Checkout',
                        path: 'features/checkout.feature',
                        // narrative: '\nIn order to make me feel a sense of accomplishment\nAs a forgetful person\nI want to ...',
                        type: 'feature',
                    },
                    title:       'Paying with a default card',
                    description: '',
                    tags: [{
                        name: 'Checkout',
                        type: 'feature',
                    }],
                    // driver: 'chrome:jane',
                    manual:    false,
                    startTime,
                    duration:  undefined,
                    result:    'SUCCESS',
                    testSource: 'cucumber',
                };

                return Object.assign(report, overrides);
            }

            function producedReport() {
                return JSON.parse(fs.readFileSync(`${rootDir}/${filename}`).toString('ascii'));
            }

        });
    });
});
