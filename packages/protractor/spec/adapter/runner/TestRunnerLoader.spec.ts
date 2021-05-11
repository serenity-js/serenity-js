import 'mocha';
import { expect } from '@integration/testing-tools';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io';
import { CucumberFormat, StandardOutput, TempFileOutput } from '@serenity-js/cucumber/lib/cli';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';
import { TestRunnerLoader } from '../../../src/adapter';

/** @test {TestRunnerLoader} */
describe('TestRunnerLoader', () => {

    const exampleRunnerId = 123;

    let moduleLoader: sinon.SinonStubbedInstance<ModuleLoader>

    beforeEach(() => {
        moduleLoader = sinon.createStubInstance(ModuleLoader);
    });

    describe('when loading a TestRunnerAdapter for', () => {

        describe('Jasmine', () => {

            it('passes the configuration to the adapter', () => {

                const jasmineNodeOpts = {   // eslint-disable-line unicorn/prevent-abbreviations
                    requires: [
                        'ts-node/register',
                    ],
                    helpers: [
                        'spec/config/*.ts'
                    ]
                };

                const testRunnerLoader = createTestRunnerLoader(exampleRunnerId);

                const JasmineAdapter = sinon.spy();
                moduleLoader.require.withArgs('@serenity-js/jasmine/lib/adapter').returns({ JasmineAdapter })

                const runner_ = testRunnerLoader.forJasmine(jasmineNodeOpts);

                expect(JasmineAdapter).to.have.been.calledWith(jasmineNodeOpts);
            });
        });

        describe('Mocha', () => {

            it('passes the configuration to the adapter', () => {

                const mochaOpts = {   // eslint-disable-line unicorn/prevent-abbreviations
                    require: [
                        'ts-node/register',
                    ],
                    retries: 2
                };

                const testRunnerLoader = createTestRunnerLoader(exampleRunnerId);

                const MochaAdapter = sinon.spy();
                moduleLoader.require.withArgs('@serenity-js/mocha/lib/adapter').returns({ MochaAdapter })

                const runner_ = testRunnerLoader.forMocha(mochaOpts);

                expect(MochaAdapter).to.have.been.calledWith(mochaOpts);
            });
        });

        describe('Cucumber', () => {

            given([{
                description: 'uses standard output when instructed to do so',
                cucumberOpts: { 'require-module': ['ts-node/register'] },
                adapterConfig: { useStandardOutput: true, uniqueFormatterOutputs: false },
                expectedOutput: StandardOutput
            }, {
                description: 'uses temp file output when instructed not to use standard output',
                cucumberOpts: { 'require-module': ['ts-node/register'] },
                adapterConfig: { useStandardOutput: false, uniqueFormatterOutputs: false },
                expectedOutput: TempFileOutput
            } ]).
            it('passes the configuration to the adapter', ({ cucumberOpts, adapterConfig, expectedOutput }) => {

                const testRunnerLoader = createTestRunnerLoader(exampleRunnerId);

                const CucumberCLIAdapter = sinon.spy();
                moduleLoader.require.withArgs('@serenity-js/cucumber/lib/cli').returns({ CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput  })

                const runner_ = testRunnerLoader.forCucumber(cucumberOpts, adapterConfig);

                expect(CucumberCLIAdapter).to.have.been.calledWith(cucumberOpts, moduleLoader, sinon.match.instanceOf(expectedOutput));
            });

            it('resolves glob patterns in `require` to absolute paths', () => {

                // eslint-disable-next-line unicorn/consistent-function-scoping
                function absolutePathTo(relativePath: string): string {
                    return Path.from(__dirname, relativePath).value;
                }

                const testRunnerLoader = createTestRunnerLoader(exampleRunnerId);

                const CucumberCLIAdapter = sinon.spy();
                moduleLoader.require.withArgs('@serenity-js/cucumber/lib/cli').returns({ CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput  })

                const cucumberOpts = {    // eslint-disable-line unicorn/prevent-abbreviations
                    require: [
                        'features/**/*.steps.ts',
                    ]
                };

                const runner_ = testRunnerLoader.forCucumber(cucumberOpts, { useStandardOutput: false, uniqueFormatterOutputs: false });

                expect(CucumberCLIAdapter).to.have.been.calledWith({
                    require: [
                        absolutePathTo('features/example.steps.ts'),
                    ]
                }, moduleLoader, sinon.match.instanceOf(TempFileOutput));
            });

            given([{
                description:            `doesn't change the output file name when uniqueFormatterOutputs are disabled`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: false },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'pretty', 'json:out.json' ] },
                expectedCucumberOpts:   { 'format': [ 'pretty', 'json:out.json' ] }
            }, {
                description:            `adds the runner ID to native formatter output file name when uniqueFormatterOutputs are enabled`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'pretty', 'json:out.json' ] },
                expectedCucumberOpts:   { 'format': [ 'pretty', `json:out.${ exampleRunnerId }.json` ] }
            }, {
                description:            `doesn't add the runner ID to formatters printing to standard output (Unix)`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ '../custom/formatter' ] },
                expectedCucumberOpts:   { 'format': [ '../custom/formatter' ] }
            }, {
                description:            `doesn't add the runner ID to formatters printing to standard output (Windows)`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'C:\\custom\\formatter' ] },
                expectedCucumberOpts:   { 'format': [ 'C:\\custom\\formatter' ] }
            }, {
                description:            `adds the runner ID to formatter printing to a relative Unix path`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ '../custom/formatter:../formatter/output.txt' ] },
                expectedCucumberOpts:   { 'format': [ `../custom/formatter:../formatter/output.${ exampleRunnerId }.txt` ] }
            }, {
                description:            `adds the runner ID to formatter printing to an absolute Unix path`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ '/custom/formatter:/formatter/output.txt' ] },
                expectedCucumberOpts:   { 'format': [ `/custom/formatter:/formatter/output.${ exampleRunnerId }.txt` ] }
            }, {
                description:            `adds the runner ID to formatter printing to an absolute Windows path`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'C:\\custom\\formatter:C:\\formatter\\output.txt' ] },
                expectedCucumberOpts:   { 'format': [ `C:\\custom\\formatter:C:\\formatter\\output.${ exampleRunnerId }.txt` ] }
            }, {
                description:            `adds the runner ID to a file without an extension (Unix)`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'custom/formatter:out' ] },
                expectedCucumberOpts:   { 'format': [ `custom/formatter:out.${ exampleRunnerId }` ] }
            }, {
                description:            `adds the runner ID to a file without an extension (Windows)`,
                adapterConfig:          { useStandardOutput: false, uniqueFormatterOutputs: true },
                expectedOutput:         TempFileOutput,
                cucumberOpts:           { 'format': [ 'C:\\custom\\formatter:out' ] },
                expectedCucumberOpts:   { 'format': [ `C:\\custom\\formatter:out.${ exampleRunnerId }` ] }
            } ]).
            it(`passes information about native Cucumber formatters to the adapter`, ({ adapterConfig, expectedOutput, cucumberOpts, expectedCucumberOpts }) => {

                const testRunnerLoader = createTestRunnerLoader(exampleRunnerId);

                const CucumberCLIAdapter = sinon.spy();
                moduleLoader.require.withArgs('@serenity-js/cucumber/lib/cli').returns({ CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput  })

                const runner_ = testRunnerLoader.forCucumber(cucumberOpts, adapterConfig);

                expect(CucumberCLIAdapter).to.have.been.calledWith(expectedCucumberOpts, moduleLoader, sinon.match.instanceOf(expectedOutput));
            });
        });
    });

    function createTestRunnerLoader(runnerId: string | number) {
        const cwd = Path.from(__dirname);

        const testRunnerLoader = new TestRunnerLoader(cwd, runnerId);
        (testRunnerLoader as any).moduleLoader = moduleLoader;

        return testRunnerLoader;
    }
});
