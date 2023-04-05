import { AnsiDiffFormatter, ArtifactArchiver, Cast, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunnerAdapter } from '@serenity-js/core/lib/adapter';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io';
import type { Capabilities } from '@wdio/types';
import type { EventEmitter } from 'events';
import { isRecord } from 'tiny-types/lib/objects';

import { BrowseTheWebWithWebdriverIO } from '../screenplay';
import { BrowserCapabilitiesReporter, InitialisesReporters, OutputStreamBuffer, ProvidesWriteStream } from './reporter';
import { OutputStreamBufferPrinter } from './reporter/OutputStreamBufferPrinter';
import { TestRunnerLoader } from './TestRunnerLoader';
import { WebdriverIOConfig } from './WebdriverIOConfig';
import { WebdriverIONotifier } from './WebdriverIONotifier';
import deepmerge = require('deepmerge');

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
        reporter: EventEmitter & ProvidesWriteStream & InitialisesReporters
    ) {
        const config = deepmerge<WebdriverIOConfig>(this.defaultConfig(), webdriverIOConfig, {
            isMergeableObject: isRecord,
        });

        // SauceLabs service serialises the config object for debugging.
        // However, since Serenity/JS Stage is a pub/sub mechanism,
        // it contains cyclic references which are not serialisable.
        // We get rid of them from the config object to avoid confusing other services.
        delete webdriverIOConfig.serenity;

        this.adapter = new TestRunnerLoader(this.loader, this.cwd, this.cid)
            .runnerAdapterFor(config);

        // This is the only (hacky) way to register a fake reporter programmatically (as of @wdio/reporter 7.4.2)
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/index.ts#L147-L181
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/reporter.ts#L24
        (reporter as any)._reporters.push(reporter.initReporter([
            BrowserCapabilitiesReporter, { serenity: this.serenity },
        ]));

        this.notifier = new WebdriverIONotifier(
            config,
            capabilities,
            reporter,
            this.adapter.successThreshold(),
            cid,
            this.specs,
        );

        const outputStreamBuffer = new OutputStreamBuffer(
            `[${this.cid}]`,
        );

        const outputStreamBufferPrinter = new OutputStreamBufferPrinter(
            outputStreamBuffer,
            reporter.getWriteStreamObject('@serenity-js/webdriverio')
        );

        this.serenity.configure({
            outputStream:       outputStreamBuffer,
            cueTimeout:         config.serenity.cueTimeout,
            interactionTimeout: config.serenity.interactionTimeout,

            diffFormatter:  config.serenity.diffFormatter ?? new AnsiDiffFormatter(),

            actors: config.serenity.actors || Cast.where(actor => actor.whoCan(
                BrowseTheWebWithWebdriverIO.using(browser),
                TakeNotes.usingAnEmptyNotepad(),
            )),

            crew: [
                ...config.serenity.crew,
                this.notifier,
                outputStreamBufferPrinter,
            ]
        });
    }

    async init(): Promise<WebdriverIOFrameworkAdapter> {

        await this.adapter.load(this.specs);

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
