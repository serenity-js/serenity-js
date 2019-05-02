import { ArtifactArchiver, Serenity } from '@serenity-js/core';
import deepmerge = require('deepmerge');
const isPlainObject = require('is-plain-object');   // tslint:disable-line:no-var-requires fails when using default import

import { Runner } from 'protractor';
import { Config } from './Config';
import { ProtractorReport, ProtractorReporter } from './reporter';
import { TestRunnerDetector } from './TestRunnerDetector';

export class ProtractorFrameworkAdapter {
    constructor(
        private readonly serenity: Serenity,
        private readonly protractorRunner: Runner,
        private readonly detector: TestRunnerDetector,
    ) {
    }

    run(specs: string[]): Promise<ProtractorReport> {

        const noop      = () => void 0;
        const config    = deepmerge<Config>(this.defaultConfig(), this.protractorRunner.getConfig(), {
            isMergeableObject: isPlainObject,
        });

        const runner    = this.detector.runnerFor(config);
        const reporter  = new ProtractorReporter(this.protractorRunner);

        this.serenity.setTheStage(reporter, ...config.serenity.crew);

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
