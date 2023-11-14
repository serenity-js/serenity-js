import 'webdriverio';

import type { Serenity } from '@serenity-js/core';
import { AnsiDiffFormatter, ArtifactArchiver, Cast, TakeNotes } from '@serenity-js/core';
import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter/index.js';
import type { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import { Path } from '@serenity-js/core/lib/io/index.js';
import { CallAnApi } from '@serenity-js/rest';
import type { Capabilities } from '@wdio/types';
import * as deepmerge from 'deepmerge';
import type { EventEmitter } from 'events';
import { isRecord } from 'tiny-types/lib/objects/isRecord.js';

import type { WebdriverIOConfig } from '../config/index.js';
import { BrowseTheWebWithWebdriverIO } from '../screenplay/index.js';
import type { InitialisesReporters, ProvidesWriteStream } from './reporter/index.js';
import { BrowserCapabilitiesReporter, OutputStreamBuffer } from './reporter/index.js';
import { OutputStreamBufferPrinter } from './reporter/OutputStreamBufferPrinter.js';
import { TestRunnerLoader } from './TestRunnerLoader.js';
import { WebdriverIONotifier } from './WebdriverIONotifier.js';

export class WebdriverIOFrameworkAdapter {

    private adapter: TestRunnerAdapter;
    private notifier: WebdriverIONotifier;

    constructor(
        private readonly serenity: Serenity,
        private readonly loader: ModuleLoader,
        private readonly cwd: Path,
        private readonly cid: string,
        webdriverIOConfig: WebdriverIOConfig,
        private readonly specs: string[],
        private readonly capabilities: Capabilities.RemoteCapability,
        private readonly reporter: EventEmitter & ProvidesWriteStream & InitialisesReporters
    ) {
        const config = deepmerge.default<WebdriverIOConfig>(this.defaultConfig(), webdriverIOConfig, {
            isMergeableObject: isRecord,
        });

        // SauceLabs service serialises the config object for debugging.
        // However, since Serenity/JS Stage is a pub/sub mechanism,
        // it contains cyclic references which are not serialisable.
        // We get rid of them from the config object to avoid confusing other services.
        delete webdriverIOConfig.serenity;

        this.adapter = new TestRunnerLoader(this.loader, this.cwd, this.cid)
            .runnerAdapterFor(config);

        this.notifier = new WebdriverIONotifier(
            config,
            capabilities,
            reporter,
            this.adapter.successThreshold(),
            cid,
            this.specs,
        );

        const outputStreamBuffer = new OutputStreamBuffer(
            `[${ this.cid }]`,
        );

        const outputStreamBufferPrinter = new OutputStreamBufferPrinter(
            outputStreamBuffer,
            reporter.getWriteStreamObject('@serenity-js/webdriverio')
        );

        this.serenity.configure({
            outputStream: outputStreamBuffer,
            cueTimeout: config.serenity.cueTimeout,
            interactionTimeout: config.serenity.interactionTimeout,

            diffFormatter: config.serenity.diffFormatter ?? new AnsiDiffFormatter(),

            actors: config.serenity.actors || Cast.where(actor => actor.whoCan(
                BrowseTheWebWithWebdriverIO.using(global.browser as unknown as WebdriverIO.Browser),
                TakeNotes.usingAnEmptyNotepad(),
                CallAnApi.using({
                    baseURL: webdriverIOConfig.baseUrl,
                }),
            )),

            crew: [
                ...config.serenity.crew,
                this.notifier,
                outputStreamBufferPrinter,
            ]
        });
    }

    async init(): Promise<WebdriverIOFrameworkAdapter> {

        // This is the only (hacky) way to register a fake reporter programmatically (as of @wdio/reporter 7.4.2)
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/index.ts#L147-L181
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/reporter.ts#L24
        const browserCapabilitiesReporter = await (this.reporter._loadReporter([
            BrowserCapabilitiesReporter, {
                serenity: this.serenity
            },
        ]));

        (this.reporter as any)._reporters.push(browserCapabilitiesReporter);

        // WebdriverIO v8 represents paths to specs as file URIs, so they need to be converted to absolute paths to avoid confusing the test runners like Cucumber
        const absolutePaths = this.specs.map(pathToSpec => Path.from(pathToSpec).value);

        await this.adapter.load(absolutePaths);

        return this;
    }

    hasTests(): boolean {
        return this.adapter.scenarioCount() > 0;
    }

    async run(): Promise<number> {
        await this.adapter.run();
        return this.notifier.failureCount();
    }

    private defaultConfig(): Partial<WebdriverIOConfig> {
        return {
            serenity: {
                crew: [
                    ArtifactArchiver.storingArtifactsAt(this.cwd.value, 'target/site/serenity'),
                ]
            }
        }
    }
}
