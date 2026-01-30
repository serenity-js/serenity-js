import 'mocha';

import { EventRecorder, expect, PickEvent, when } from '@integration/testing-tools';
import { configure, Timestamp } from '@serenity-js/core';
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
import type { CorrelationId } from '@serenity-js/core/lib/model';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import {
    CucumberCLIAdapter,
    type CucumberConfig,
    type SerenityFormatterOutput,
    StandardOutput,
    TempFileOutput as TemporaryFileOutput
} from '@serenity-js/cucumber/lib/adapter';
import { given } from 'mocha-testdata';

import { cucumberVersion } from '../src';

const { stdout } = require('test-console');

describe('CucumberCLIAdapter', function () {

    this.timeout(30_000);

    let recorder: EventRecorder;

    const rootDirectory = Path.from(__dirname);

    beforeEach(() => {
        recorder = new EventRecorder();

        configure({
            crew: [ recorder ]
        });
    });

    describe('registers @serenity-js/cucumber and', () => {

        it('runs together with native Cucumber formatters, when configured to print to a temp file', async () => {
            const output = await run({ format: [ 'progress' ] }, new TemporaryFileOutput(new FileSystem(rootDirectory)));

            expect(output).to.include(trimmed`
                | 1 scenario (1 passed)
                | 1 step (1 passed)
            `);

            let currentSceneId: CorrelationId;

            PickEvent.from(recorder.events)
                .next(TestRunStarts, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('A passing scenario'))
                    expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                    expect(event.details.location.line).to.equal(3);
                    expect(event.details.location.column).to.equal(3);

                    currentSceneId = event.sceneId;
                })
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('JS')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished, event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneFinishes, event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished, event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished, event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        });

        given<Example>([ {
            description: 'no custom formats => default output',
            config: {
                format: [ 'progress' ],
            },
            expectedOutput: trimmed`
                | 1 scenario (1 passed)
                | 1 step (1 passed)
            `
        }, {
            description: 'custom formats => custom output',
            config: {
                format: cucumberVersion().major() > 2
                    ? [ 'usage' ]
                    : [ 'pretty' ],
            },
            expectedOutput: cucumberVersion().major() > 2
                ? 'Pattern / Text'
                : 'Feature: Serenity/JS recognises a passing scenario'
        } ]).
        it('runs together with native Cucumber formatters, when configured to print to a temp file', async ({ config, expectedOutput }: Example) => {
            const output = await run(config, new TemporaryFileOutput(new FileSystem(rootDirectory)));

            expect(output).to.include(expectedOutput);

            let currentSceneId: CorrelationId;

            PickEvent.from(recorder.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A passing scenario'))
                    expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                    expect(event.details.location.line).to.equal(3);
                    expect(event.details.location.column).to.equal(3);

                    currentSceneId = event.sceneId;
                })
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('JS')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneFinishes,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        });

        describe('when configured to print to standard output', () => {

            when(cucumberVersion().major() > 2).
            it('produces no output when no native Cucumber formatters are configured', async () => {
                const output = await run({ }, new StandardOutput());

                expect(output).to.equal('');

                let currentSceneId: CorrelationId;

                PickEvent.from(recorder.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A passing scenario'))
                        expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('JS')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.equal(new ExecutionSuccessful());
                    })
                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            });

            when(cucumberVersion().major() > 2).
            it('takes precedence over any native formatters and prevents them from printing to standard output', async () => {
                const output = await run({ format: 'progress' }, new StandardOutput());

                expect(output).to.equal('');

                let currentSceneId: CorrelationId;

                PickEvent.from(recorder.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A passing scenario'))
                        expect(event.details.location.path.value).to.match(/features\/passing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('JS')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.equal(new ExecutionSuccessful());
                    })
                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            });
        });
    });

    function clearRequireCache(patterns: string[]) {
        const cachedImports = Object.keys(require.cache);
        const importsToClear = cachedImports.filter(key => patterns.some((pattern: string) => key.includes(pattern)));

        importsToClear.forEach(function (key) {
            delete require.cache[key];
        });
    }

    function configDefaults(): CucumberConfig & Record<any, any> {
        const specDirectory = `${ process.cwd() }/node_modules/@integration/cucumber-specs/features`;

        if (cucumberVersion().major() > 2) {
            return { formatOptions: { colorsEnabled: false, specDirectory } }
        }

        if (cucumberVersion().major() === 2) {
            return { formatOptions: { colorsEnabled: false, specDirectory }, backtrace: true }
        }

        return { noColors: true, specDirectory };
    }

    async function run(config: CucumberConfig, output: SerenityFormatterOutput): Promise<string> {
        clearRequireCache([
            cucumberVersion().major() > 2 ? '.steps.ts' : undefined,
            'packages/cucumber'
        ].filter(Boolean));

        /**
         * we have to remove FORCE_COLOR because:
         * - IntelliJ sets it to true, and this can't be changed
         * - When Cucumber picks up that variable, it ignores any other configuration regarding output colors, delegating responsibility to Chalk
         *   https://github.com/cucumber/cucumber-js/blob/3928c673378ccabf2138b7c55873f6981e9eb134/src/formatter/get_color_fns.ts#L68
         * - Chalk uses global process.env, so even if we try to tell Cucumber to use FORCE_COLOR=0, this won't be passed to Chalk
         */
        delete process.env.FORCE_COLOR;

        const adapter = new CucumberCLIAdapter(
            {
                ... configDefaults(),
                require: ['./src/step_definitions/common.steps.ts' ],
                ... config,
            },
            new ModuleLoader(process.cwd()),
            new FileSystem(rootDirectory),
            output,
        );

        const inspect = stdout.inspect();

        await adapter.load([ './node_modules/@integration/cucumber-specs/features/passing_scenario.feature' ])

        try {
            await adapter.run();
            return inspect.output.join('');
        }
        finally {
            inspect.restore();
        }
    }

    interface Example {
        description: string;
        config: CucumberConfig;
        expectedOutput: string;
    }
});
