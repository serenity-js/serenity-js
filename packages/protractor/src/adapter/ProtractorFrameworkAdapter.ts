import { ArtifactArchiver, Duration, Serenity } from '@serenity-js/core';
import deepmerge = require('deepmerge');
const isPlainObject = require('is-plain-object');   // tslint:disable-line:no-var-requires fails when using default import

import { Runner } from 'protractor';
import { Config } from './Config';
import { ProtractorReport, ProtractorReporter } from './reporter';
import { TestRunnerDetector } from './TestRunnerDetector';

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

        const noop      = () => void 0;
        const config    = deepmerge<Config>(this.defaultConfig(), this.protractorRunner.getConfig(), {
            isMergeableObject: isPlainObject,
        });

        const runner    = this.detector.runnerFor(config);
        const reporter  = new ProtractorReporter(this.protractorRunner);

        this.serenity.configure({
            cueTimeout:     config.serenity.cueTimeout,
            actors:         config.serenity.actors,
            crew:           [...config.serenity.crew, reporter],
        });

        return Promise.resolve()
            .then(() => this.protractorRunner.runTestPreparer(TestRunnerDetector.protractorCliOptions()))
            .then(() => runner.run(specs))
            .then(() => Promise.resolve((config.onComplete || noop)()))
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
