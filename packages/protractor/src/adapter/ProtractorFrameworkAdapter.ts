import { Serenity } from '@serenity-js/core';
import { Runner } from 'protractor';

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
        const config    = this.protractorRunner.getConfig();
        const runner    = this.detector.runnerFor(config);
        const reporter  = new ProtractorReporter(this.protractorRunner);

        this.serenity.setTheStage(reporter);

        return Promise.resolve()
            .then(() => this.protractorRunner.runTestPreparer(TestRunnerDetector.protractorCliOptions()))
            .then(() => runner.run(specs))
            .then(() => Promise.resolve((config.onComplete || noop)()))
            .then(() => reporter.report());
    }
}
