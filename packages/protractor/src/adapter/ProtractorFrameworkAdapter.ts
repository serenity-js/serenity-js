import { ArtifactArchiver, Serenity } from '@serenity-js/core';
import { protractor, Runner } from 'protractor';
import { isRecord } from 'tiny-types/lib/objects';
import deepmerge = require('deepmerge');
const querySelectorShadowDomPlugin = require('query-selector-shadow-dom/plugins/protractor');   // eslint-disable-line @typescript-eslint/no-var-requires

import { BrowserDetector, StandardisedCapabilities } from './browser-detector';
import { Config } from './Config';
import { ProtractorReport, ProtractorReporter } from './reporter';
import { TestRunnerDetector } from './runner';

/**
 * @private
 */
export class ProtractorFrameworkAdapter {
    constructor(
        private readonly serenity: Serenity,
        private readonly protractorRunner: Runner,
        private readonly detector: TestRunnerDetector,
    ) {
    }

    /**
     * @param {string[]} specs
     *  Paths to spec files
     *
     * @return {Promise<ProtractorReport>}
     */
    run(specs: string[]): Promise<ProtractorReport> {

        if (! this.protractorRunner.plugins_?.pluginObjs?.some(plugin => plugin.name === querySelectorShadowDomPlugin.name)) {
            this.protractorRunner.plugins_?.pluginObjs?.push(querySelectorShadowDomPlugin);
        }

        const runner    = this.detector.runnerFor(this.protractorRunner.getConfig());
        const reporter  = new ProtractorReporter(this.protractorRunner, runner.successThreshold());

        const config    = deepmerge<Config>(this.defaultConfig(), this.protractorRunner.getConfig(), {
            isMergeableObject: isRecord,
        });

        this.serenity.configure({
            cueTimeout:     config.serenity.cueTimeout,
            actors:         config.serenity.actors,
            crew:           [
                BrowserDetector.with(StandardisedCapabilities.of(() => protractor.browser)),
                ...config.serenity.crew,
                reporter,
            ],
        });

        return Promise.resolve()
            .then(() => this.protractorRunner.runTestPreparer(TestRunnerDetector.protractorCliOptions()))
            .then(() => runner.load(specs))
            .then(() => runner.run())
            .then(() => (config.onComplete || noop)())
            .then(() => reporter.report());
    }

    private defaultConfig(): Config {
        return {
            serenity: {
                crew: [
                    ArtifactArchiver.storingArtifactsAt(process.cwd(), 'target/site/serenity'),
                ],
            },
        };
    }
}

/** @private */
function noop() {
    // no-op
}
