
import { EventRecorder, EventStreamEmitter, expect, PickEvent } from '@integration/testing-tools';
import { Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { Extras } from '@serenity-js/core/lib/stage/Extras';
import { beforeEach, describe, it } from 'mocha';

import { SerenityBDDReporter } from '../../../../../src';

const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('SerenityBDDReporter', () => {

    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(2);
    const cwd = '/home/alice/projects/my-app';

    let reporter: SerenityBDDReporter,
        stage: Stage,
        emitter: EventStreamEmitter,
        recorder: EventRecorder;

    beforeEach(() => {
        const frozenClock = new Clock(() => new Date(0))
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), frozenClock), new ErrorFactory(), clock, interactionTimeout);
        emitter = new EventStreamEmitter(stage);
        recorder = new EventRecorder([], stage);

        const fakeDirectoryStructure = {
            [`${ cwd }`]: {
                'features': {
                    'search.feature': 'Feature: Search',
                    'tags.feature': 'Feature: Tag management',
                }
            }
        }

        reporter = SerenityBDDReporter
            .fromJSON({
                // specDir: 'features', // auto-detects
            })
            .build({
                stage,
                fileSystem: new FileSystem(Path.from(cwd), memfs(fakeDirectoryStructure).fs),
                // SerenityBDDReporter doesn't use the outputStream, so we don't need it
                outputStream: undefined,
            });

        stage.assign(reporter);
        stage.assign(recorder);
    });

    it(`works when events are in order`, () =>
        emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2020-10-08T16:14:59.637Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
                {"type":"TaskStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10urdx00arcuun2wz2b721","timestamp":"2020-10-08T16:15:00.645Z","details":{"name":"When he enters search details","location":{"path":"fake.ts"}}}}
                    {"type":"TaskStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b3cuun69j179uv","timestamp":"2020-10-08T16:15:31.634Z","details":{"name":"Bob chooses first option","location":{"path":"fake.ts"}}}}
                        {"type":"InteractionStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b4cuun76se5lvf","timestamp":"2020-10-08T16:15:31.634Z","details":{"name":"Bob waits up to 5s until the first option does become clickable","location":{"path":"fake.ts"}}}}
                        {"type":"InteractionFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b4cuun76se5lvf","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Waited 5s for the first option to become clickable\\\\n\\",\\"message\\":\\"Waited 5s for the first option to become clickable\\",\\"expected\\":null,\\"actual\\":null}"},"timestamp":"2020-10-08T16:15:41.906Z","details":{"name":"Bob waits up to 5s until the first option does become clickable","location":{"path":"fake.ts"}}}}
                    {"type":"TaskFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b3cuun69j179uv","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Waited 5s for the first option to become clickable\\\\n\\",\\"message\\":\\"Waited 5s for the first option to become clickable\\",\\"expected\\":null,\\"actual\\":null}"},"timestamp":"2020-10-08T16:15:41.907Z","details":{"name":"Bob chooses first option","location":{"path":"fake.ts"}}}}
                {"type":"TaskFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10urdx00arcuun2wz2b721","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.649Z","details":{"name":"When he enters search details","location":{"path":"fake.ts"}}}}
            {"type":"SceneFinishes","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.650Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.661Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
            {"type":"SceneStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","timestamp":"2020-10-08T16:15:40.663Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
                {"type":"TaskStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9k00bbcuun7p1h7cce","timestamp":"2020-10-08T16:15:40.664Z","details":{"name":"Given Adam is logged in","location":{"path":"fake.ts"}}}}
                    {"type":"InteractionStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9l00bdcuun74ye4qww","timestamp":"2020-10-08T16:15:40.665Z","details":{"name":"Adam navigates to '/'","location":{"path":"fake.ts"}}}}
                    {"type":"InteractionFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9l00bdcuun74ye4qww","outcome":{"code":64},"timestamp":"2020-10-08T16:15:41.908Z","details":{"name":"Adam navigates to '/'","location":{"path":"fake.ts"}}}}
                {"type":"TaskFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9k00bbcuun7p1h7cce","outcome":{"code":64},"timestamp":"2020-10-08T16:15:42.682Z","details":{"name":"Given Adam is logged in","location":{"path":"fake.ts"}}}}
            {"type":"SceneFinishes","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 10000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 10000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:52.689Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 10000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 10000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:52.701Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
            {"type":"TestRunFinishes","event":"2020-10-08T16:16:15.302Z"}
            {"type":"TestRunFinished","event":{"outcome":{"code":64},"timestamp":"2020-10-08T16:16:15.313Z"}}
        `).then(() => {

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, ({ artifact }) => {
                    const report = artifact.map(_ => _);

                    expect(report).to.deep.equal(firstExpectedReport)
                })
                .next(ArtifactGenerated, ({ artifact }) => {
                    const report = artifact.map(_ => _);

                    expect(report).to.deep.equal(secondExpectedReport)
                });

        }));

    it(`correctly reconciles out of order events`, () =>
        emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2020-10-08T16:14:59.637Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
                {"type":"TaskStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10urdx00arcuun2wz2b721","timestamp":"2020-10-08T16:15:00.645Z","details":{"name":"When he enters search details","location":{"path":"fake.ts"}}}}
                    {"type":"TaskStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b3cuun69j179uv","timestamp":"2020-10-08T16:15:31.634Z","details":{"name":"Bob chooses first option","location":{"path":"fake.ts"}}}}
                        {"type":"InteractionStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b4cuun76se5lvf","timestamp":"2020-10-08T16:15:31.634Z","details":{"name":"Bob waits up to 5s until the first option does become clickable","location":{"path":"fake.ts"}}}}
                {"type":"TaskFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10urdx00arcuun2wz2b721","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.649Z","details":{"name":"When he enters search details","location":{"path":"fake.ts"}}}}
            {"type":"SceneFinishes","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.650Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 40000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 40000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:40.661Z","details":{"category":"Search","location":{"column":3,"line":15,"path":"/home/alice/projects/my-app/features/search.feature"},"name":"Advanced search"}}}
            {"type":"SceneStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","timestamp":"2020-10-08T16:15:40.663Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
                {"type":"TaskStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9k00bbcuun7p1h7cce","timestamp":"2020-10-08T16:15:40.664Z","details":{"name":"Given Adam is logged in","location":{"path":"fake.ts"}}}}
                    {"type":"InteractionStarts","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9l00bdcuun74ye4qww","timestamp":"2020-10-08T16:15:40.665Z","details":{"name":"Adam navigates to '/'","location":{"path":"fake.ts"}}}}
                                {"type":"InteractionFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b4cuun76se5lvf","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Waited 5s for the first option to become clickable\\\\n\\",\\"message\\":\\"Waited 5s for the first option to become clickable\\",\\"expected\\":null,\\"actual\\":null}"},"timestamp":"2020-10-08T16:15:41.906Z","details":{"name":"Bob waits up to 5s until the first option does become clickable","location":{"path":"fake.ts"}}}}
                            {"type":"TaskFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","activityId":"ckg10vfaq00b3cuun69j179uv","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Waited 5s for the first option to become clickable\\\\n\\",\\"message\\":\\"Waited 5s for the first option to become clickable\\",\\"expected\\":null,\\"actual\\":null}"},"timestamp":"2020-10-08T16:15:41.907Z","details":{"name":"Bob chooses first option","location":{"path":"fake.ts"}}}}
                    {"type":"InteractionFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9l00bdcuun74ye4qww","outcome":{"code":64},"timestamp":"2020-10-08T16:15:41.908Z","details":{"name":"Adam navigates to '/'","location":{"path":"fake.ts"}}}}
                {"type":"TaskFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","activityId":"ckg10vm9k00bbcuun7p1h7cce","outcome":{"code":64},"timestamp":"2020-10-08T16:15:42.682Z","details":{"name":"Given Adam is logged in","location":{"path":"fake.ts"}}}}
            {"type":"SceneFinishes","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 10000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 10000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:52.689Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg9wf6xr000001qd8igkb90j","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 10000 milliseconds\\\\n\\",\\"message\\":\\"function timed out, ensure the promise resolves within 10000 milliseconds\\"}"},"timestamp":"2020-10-08T16:15:52.701Z","details":{"category":"Tag management","location":{"column":3,"line":5,"path":"/home/alice/projects/my-app/features/tags.feature"},"name":"Create new tag"}}}
            {"type":"TestRunFinishes","event":"2020-10-08T16:16:15.302Z"}
            {"type":"TestRunFinished","event":{"outcome":{"code":64},"timestamp":"2020-10-08T16:16:15.313Z"}}
        `).then(() => {

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, ({ artifact }) => {
                    const report = artifact.map(_ => _);

                    expect(report).to.deep.equal(firstExpectedReport)
                })
                .next(ArtifactGenerated, ({ artifact }) => {
                    const report = artifact.map(_ => _);

                    expect(report).to.deep.equal(secondExpectedReport)
                });

        }));

    const firstExpectedReport = {
        'name': 'Advanced search',
        'title': 'Advanced search',
        'manual': false,
        'testFailureClassname': 'Error',
        'testFailureMessage': 'function timed out, ensure the promise resolves within 40000 milliseconds',
        'testFailureSummary': 'ERROR;Error;function timed out, ensure the promise resolves within 40000 milliseconds;',
        'testSteps': [
            {
                'number': 1,
                'description': 'When he enters search details',
                'startTime': '2020-10-08T16:15:00.645Z',
                'children': [
                    {
                        'number': 2,
                        'description': 'Bob chooses first option',
                        'startTime': '2020-10-08T16:15:31.634Z',
                        'children': [
                            {
                                'number': 3,
                                'description': 'Bob waits up to 5s until the first option does become clickable',
                                'startTime': '2020-10-08T16:15:31.634Z',
                                'children': [],
                                'reportData': [],
                                'screenshots': [],
                                'result': 'FAILURE',
                                'duration': 10272,
                                'exception': {
                                    'errorType': 'AssertionError',
                                    'message': 'Waited 5s for the first option to become clickable',
                                    'stackTrace': [
                                        {
                                            'declaringClass': '',
                                            'methodName': '',
                                            'fileName': 'AssertionError: Waited 5s for the first option to become clickable'
                                        }
                                    ]
                                }
                            }
                        ],
                        'reportData': [],
                        'screenshots': [],
                        'result': 'FAILURE',
                        'duration': 10273
                    }
                ],
                'reportData': [],
                'screenshots': [],
                'result': 'ERROR',
                'duration': 40004
            }
        ],
        'userStory': {
            'id': 'search',
            'storyName': 'Search',
            'displayName': 'Search',
            'narrative': '',
            'path': 'search',
            'pathElements': [{
                'name': 'search',
                'description': 'Search',
            }],
            'type': 'feature'
        },
        'startTime': '2020-10-08T16:14:59.637Z',
        'duration': 41024,
        'result': 'ERROR',
        'testFailureCause': {
            'errorType': 'Error',
            'message': 'function timed out, ensure the promise resolves within 40000 milliseconds',
            'stackTrace': [
                {
                    'declaringClass': '',
                    'methodName': '',
                    'fileName': 'Error: function timed out, ensure the promise resolves within 40000 milliseconds'
                }
            ]
        },
        'id': 'search;advanced-search'
    };

    const secondExpectedReport = {
        'name': 'Create new tag',
        'title': 'Create new tag',
        'manual': false,
        'testFailureClassname': 'Error',
        'testFailureMessage': 'function timed out, ensure the promise resolves within 10000 milliseconds',
        'testFailureSummary': 'ERROR;Error;function timed out, ensure the promise resolves within 10000 milliseconds;',
        'testSteps': [
            {
                'number': 1,
                'description': 'Given Adam is logged in',
                'startTime': '2020-10-08T16:15:40.664Z',
                'children': [
                    {
                        'number': 2,
                        'description': 'Adam navigates to &apos;/&apos;',
                        'startTime': '2020-10-08T16:15:40.665Z',
                        'children': [],
                        'reportData': [],
                        'screenshots': [],
                        'result': 'SUCCESS',
                        'duration': 1243
                    }
                ],
                'reportData': [],
                'screenshots': [],
                'result': 'SUCCESS',
                'duration': 2018
            }
        ],
        'userStory': {
            'id': 'tag-management',
            'storyName': 'Tag management',
            'displayName': 'Tag management',
            'narrative': '',
            'path': 'tags',
            'pathElements': [{
                'name': 'tags',
                'description': 'Tags',
            }],
            'type': 'feature'
        },
        'startTime': '2020-10-08T16:15:40.663Z',
        'duration': 12038,
        'result': 'ERROR',
        'testFailureCause': {
            'errorType': 'Error',
            'message': 'function timed out, ensure the promise resolves within 10000 milliseconds',
            'stackTrace': [
                {
                    'declaringClass': '',
                    'methodName': '',
                    'fileName': 'Error: function timed out, ensure the promise resolves within 10000 milliseconds'
                }
            ]
        },
        'id': 'tag-management;create-new-tag'
    };
});
