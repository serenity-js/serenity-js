import { ArtifactArchiver, Serenity } from '@serenity-js/core';
import { ModuleLoader, Path, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import type { Capabilities } from '@wdio/types';
import type { EventEmitter } from 'events';
import { isPlainObject } from 'is-plain-object';

import { BrowserCapabilitiesReporter, InitialisesReporters, OutputStreamBuffer, ProvidesWriteStream } from './reporter';
import { OutputStreamBufferPrinter } from './reporter/OutputStreamBufferPrinter';
import { TestRunnerLoader } from './TestRunnerLoader';
import { WebdriverIOConfig } from './WebdriverIOConfig';
import { WebdriverIONotifier } from './WebdriverIONotifier';
import deepmerge = require('deepmerge');

/**
 * @package
 */
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
            isMergeableObject: isPlainObject,
        });

        this.adapter = new TestRunnerLoader(this.loader, this.cwd, this.cid)
            .runnerAdapterFor(config);

        // This is the only (hacky) way to register a fake reporter programmatically (as of @wdio/reporter 7.4.2)
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/index.ts#L147-L181
        //  - https://github.com/webdriverio/webdriverio/blob/365fb0ad79fcf4471f21f23e18afa6818986dbdb/packages/wdio-runner/src/reporter.ts#L24
        (reporter as any)._reporters.push(reporter.initReporter([
            BrowserCapabilitiesReporter, { serenity: this.serenity },
        ]));

        this.notifier = new WebdriverIONotifier(
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
            outputStream:   outputStreamBuffer,
            cueTimeout:     config.serenity.cueTimeout,
            actors:         config.serenity.actors,
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

    run(): Promise<number> {
        return this.adapter.run().then(() =>
            this.notifier.failureCount()
        );
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
