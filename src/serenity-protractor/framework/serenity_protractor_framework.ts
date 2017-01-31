import { Runner } from 'protractor';
import { serenity, Serenity } from '../..';
import { serenityBDDReporter } from '../../serenity/reporting';
import { ProtractorReport, ProtractorReporter } from '../reporting';
import { SerenityFrameworkConfig } from './serenity_framework_config';
import { TestFramework } from './test_framework';
import { TestFrameworkDetector } from './test_framework_detector';

// spec: https://github.com/angular/protractor/blob/master/lib/frameworks/README.md

const noop = () => undefined;

export function run(runner: Runner, specs: string[]): PromiseLike<ProtractorReport> {
    return new SerenityProtractorFramework(serenity, runner).run(specs);
}

export class SerenityProtractorFramework {

    public config: SerenityFrameworkConfig;

    private framework: TestFramework;
    private reporter: ProtractorReporter;

    constructor(private serenity: Serenity, private runner: Runner) {
        this.config    = Object.assign({}, this.defaultConfig(), runner.getConfig());
        this.reporter  = new ProtractorReporter(runner);
        this.framework = new TestFrameworkDetector().frameworkFor(this.config);

        this.serenity.assignCrewMembers(...this.config.serenity.crew, this.reporter);
    }

    run = (specs: string[]): PromiseLike<ProtractorReport> => this.runner.runTestPreparer().then(() =>
        this.framework.run(specs).
            then(noop, this.analyzeTheFailure).
            then(() => this.serenity.waitForAnyOutstandingTasks()).
            then(() => this.waitForOtherProtractorPlugins()).
            then(() => this.reporter.finalResults()));

    private analyzeTheFailure = (issue: any) => new Promise((resolve, reject) => {
        return issue instanceof Error
            ? reject(issue)
            : resolve(issue);   // Cucumber returns "false" when the run fails and Mocha returns the number of failed tests.
                                // Both those cases are handled by Protractor based on the final test results reported by Serenity/JS,
                                // so we don't need any additional error handling here.
    })

    private waitForOtherProtractorPlugins = () => Promise.resolve(this.config.onComplete || noop);

    private defaultConfig = (): SerenityFrameworkConfig => ({
        serenity: {
            crew: [ serenityBDDReporter() ],
        },
    })
}
