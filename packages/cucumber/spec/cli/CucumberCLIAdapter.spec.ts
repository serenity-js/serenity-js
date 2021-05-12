/* eslint-disable unicorn/filename-case,unicorn/prevent-abbreviations */
import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { configure } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { FileSystem, ModuleLoader, Path, trimmed } from '@serenity-js/core/lib/io';
import { ExecutionSuccessful, FeatureTag, Name, Timestamp } from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';
import * as path from 'path';   // eslint-disable-line unicorn/import-style

import { CucumberCLIAdapter, CucumberConfig, SerenityFormatterOutput, StandardOutput, TempFileOutput } from '../../src/cli';

const { stdout } = require('test-console'); // eslint-disable-line @typescript-eslint/no-var-requires

/** @test {CucumberCLIAdapter} */
describe('CucumberCLIAdapter', function () {

    this.timeout(5000);

    let recorder: EventRecorder;

    const rootDir = Path.from(__dirname);

    beforeEach(() => {
        recorder = new EventRecorder();

        configure({
            crew: [ recorder ]
        });
    });

    describe('registers @serenity-js/cucumber and', () => {

        given<Example>([ {
            description: 'no custom formats => default output',
            config: { formatOptions: { colorsEnabled: false } },
            expectedOutput: trimmed`
                | ..
                |
                | 1 scenario (1 passed)
                | 1 step (1 passed)
            `
        }, {
            description: 'custom formats => custom output',
            config: {
                format: [ 'usage' ],
                formatOptions: { colorsEnabled: false }
            },
            expectedOutput: 'Pattern / Text'
        } ]).
        it('runs together with native Cucumber formatters, when configured to print to a temp file', ({ config, expectedOutput }: Example) =>
            run(config, new TempFileOutput(new FileSystem(rootDir)))
                .then(output => {
                    expect(output).to.include(expectedOutput);

                    PickEvent.from(recorder.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('A passing scenario'))
                            expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                            expect(event.details.location.line).to.equal(3);
                            expect(event.details.location.column).to.equal(3);
                        })
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('A passing feature')))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;
                })
        );

        given<Example>([ {
            description: 'no custom formats => no output',
            config: {},
            expectedOutput: ''
        }, {
            description: 'custom formats => no output',
            config: {
                format: 'usage'
            },
            expectedOutput: ''
        } ]).
        it('takes precedence over native the standard output formatters, if configured to do so', ({ config, expectedOutput }: Example) =>
            run(config, new StandardOutput()).then(output => {
                expect(output).to.equal('');

                PickEvent.from(recorder.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A passing scenario'))
                        expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('A passing feature')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            })
        )
    });

    class LocalModuleLoader extends ModuleLoader {
        resolve(moduleId: string): string {
            if (moduleId === '@serenity-js/cucumber') {
                return super.resolve(path.resolve(__dirname, '../../src'));
            }

            return super.resolve(moduleId);
        }
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function clearRequireCache(pattern: string) {
        Object.keys(require.cache)
            .filter(key => key.includes(pattern))
            .forEach(function (key) {
                delete require.cache[key];
            });
    }

    function run(config: CucumberConfig, output: SerenityFormatterOutput): Promise<string> {
        clearRequireCache('steps.ts');

        const adapter = new CucumberCLIAdapter({
            ...config,
            require: [ path.resolve(__dirname, 'features/step_definitions/steps.ts') ],
        }, new LocalModuleLoader(rootDir.value), output);

        const inspect = stdout.inspect();

        return adapter
            .run([ 'features/passing_scenario.feature' ])
            .then(() => {
                inspect.restore();
                return inspect.output.join('');
            }, error => {
                inspect.restore();
                throw error;
            });
    }

    interface Example {
        description: string;
        config: CucumberConfig;
        expectedOutput: string;
    }
});
