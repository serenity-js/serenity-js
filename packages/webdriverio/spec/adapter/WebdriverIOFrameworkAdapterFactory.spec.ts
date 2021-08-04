/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Clock, ConfigurationError, Serenity } from '@serenity-js/core';
import { ModuleLoader, Path, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { ExecutionIgnored, Outcome } from '@serenity-js/core/lib/model';
import Reporter from '@wdio/reporter';
import type { Capabilities, Reporters } from '@wdio/types';
import * as sinon from 'sinon';
import EventEmitter = require('events');

import { WebdriverIOFrameworkAdapterFactory } from '../../src/adapter';
import { InitialisesReporters, ProvidesWriteStream } from '../../src/adapter/reporter';
import { WebdriverIOConfig } from '../../src/adapter/WebdriverIOConfig';

describe('WebdriverIOFrameworkAdapterFactory', () => {

    const
        cid     = '0-0',
        specs   = [ '/users/jan/project/spec/example.spec.ts' ],
        capabilities: Capabilities.RemoteCapability = { browserName: 'chrome' };

    let serenity:       Serenity,
        loader:         sinon.SinonStubbedInstance<ModuleLoader>,
        baseReporter:   FakeBaseReporter,
        factory:        WebdriverIOFrameworkAdapterFactory;

    beforeEach(() => {
        serenity        = new Serenity(new Clock());
        loader          = sinon.createStubInstance(ModuleLoader);
        baseReporter    = new FakeBaseReporter();
        factory         = new WebdriverIOFrameworkAdapterFactory(
            serenity,
            loader,
            Path.from(__dirname),
        );
    });

    function defaultConfig(overrides: Partial<WebdriverIOConfig> = {}): WebdriverIOConfig {
        return {
            capabilities: [ capabilities ],
            ...overrides,
        }
    }

    describe('when initialising WebdriverIOFrameworkAdapter', () => {

        /*
         * WebdriverIO uses 'mocha' by default, so we do the same:
         * - https://github.com/webdriverio/webdriverio/blob/44b5318a8893c032d7d4989079109782a2ce9a79/packages/wdio-config/src/constants.ts#L18
         */
        it('loads specs using @serenity-js/mocha adapter by default', async () => {

            const config = defaultConfig();

            loader.require.withArgs('@serenity-js/mocha/lib/adapter').returns({ MochaAdapter: FakeTestRunnerAdapter })

            await factory.init(cid, config, specs, capabilities, baseReporter);

            expect(FakeTestRunnerAdapter.loadedPathsToScenarios).to.deep.equal(specs);
        });

        it('loads specs using @serenity-js/mocha when configured to do so', async () => {

            const config = defaultConfig({
                serenity: {
                    runner: 'mocha',
                }
            });

            loader.require.withArgs('@serenity-js/mocha/lib/adapter').returns({ MochaAdapter: FakeTestRunnerAdapter })

            await factory.init(cid, config, specs, capabilities, baseReporter);

            expect(FakeTestRunnerAdapter.loadedPathsToScenarios).to.deep.equal(specs);
        });

        it('loads specs using @serenity-js/jasmine when configured to do so', async () => {

            const config = defaultConfig({
                serenity: {
                    runner: 'jasmine',
                }
            });

            loader.require.withArgs('@serenity-js/jasmine/lib/adapter').returns({ JasmineAdapter: FakeTestRunnerAdapter })

            await factory.init(cid, config, specs, capabilities, baseReporter);

            expect(FakeTestRunnerAdapter.loadedPathsToScenarios).to.deep.equal(specs);
        });

        // todo
        it('loads specs using @serenity-js/cucumber when configured to do so');

        it('complains when configured with an invalid runner', () => {
            const config = defaultConfig({
                serenity: {
                    runner: 'invalid',
                }
            });

            expect(() => factory.init(cid, config, specs, capabilities, baseReporter))
                .to.throw(ConfigurationError, '"invalid" is not a supported test runner. Please use "mocha", "jasmine", or "cucumber"');
        });
    });

    // https://github.com/webdriverio/webdriverio/blob/main/packages/wdio-runner/src/reporter.ts#L127
    class FakeBaseReporter extends EventEmitter implements ProvidesWriteStream, InitialisesReporters {
        public output = '';
        public _reporters = [];

        getWriteStreamObject(reporter: string) {
            return {
                write: (content: string): void => {
                    this.output += content;
                }
            };
        }

        initReporter(reporter: Reporters.ReporterEntry): Reporter {
            const
                ReporterClass   = reporter[0],
                options         = reporter[1];

            return new ReporterClass({
                ...options,
                writeStream: this.getWriteStreamObject(ReporterClass.name)
            });
        }
    }

    class FakeTestRunnerAdapter implements TestRunnerAdapter {

        public static loadedPathsToScenarios: string[];

        async load(pathsToScenarios: string[]): Promise<void> {
            FakeTestRunnerAdapter.loadedPathsToScenarios = pathsToScenarios;
        }

        scenarioCount(): number {
            return 1;
        }

        async run(): Promise<void> {
            // no-op
        }

        successThreshold(): Outcome | { Code: number } {
            return ExecutionIgnored;
        }
    }
});
