import { Runner } from 'protractor';
import { serenity, Serenity } from '../..';
import { CucumberTestFramework } from '../../serenity-cucumber/cucumber_test_framework';
import { MochaTestFramework } from '../../serenity-mocha';
import { jsonReporter } from '../../serenity/stage/json_reporter';
import { ProtractorReport } from './protractor_report';
import { ProtractorReporter } from './protractor_reporter';
import { SerenityFrameworkConfig } from './serenity_framework_config';
import { TestFramework } from './test_framework';

// spec: https://github.com/angular/protractor/blob/master/lib/frameworks/README.md

const noop = () => undefined;

export function run(runner: Runner, specs: string[]): PromiseLike<ProtractorReport> {
    return new SerenityProtractorFramework(serenity, runner).run(specs);
}

export class SerenityProtractorFramework {

    public config: SerenityFrameworkConfig;
    private reporter: ProtractorReporter;

    constructor(private serenity: Serenity, private runner: Runner) {
        this.config   = Object.assign({}, this.defaultConfig(), runner.getConfig());
        this.reporter = new ProtractorReporter(runner);

        this.serenity.assignCrewMembers(...this.config.serenity.crew, this.reporter);
    }

    run(specs: string[]): PromiseLike<ProtractorReport> {

        const framework = this.testFrameworkBasedOn(this.config);

        return this.runner.runTestPreparer().then(() => {
            return framework.
                run(specs).
                // cucumber returns "false" when the run fails,
                // but we don't care as it's Protractor's responsibility to return the correct error code
                // based on the test results, hence `noop`
                then(noop, console.warn).
                then(() => serenity.waitForAnyOutstandingTasks()).
                then(() => this.waitForOtherProtractorPlugins()).
                then(() => this.reporter.finalResults());
        });
    }

    private testFrameworkBasedOn(config: SerenityFrameworkConfig): TestFramework {
        switch (config.serenity.dialect.toLowerCase()) {
            case 'cucumber':
                // tslint:disable-next-line:no-string-literal
                const cucumberConfig = Object.assign({}, config.cucumberOpts, config.capabilities[ 'cucumberOpts' ]);

                return new CucumberTestFramework(this, cucumberConfig);
            case 'mocha':
                // tslint:disable-next-line:no-string-literal
                const mochaConfig = Object.assign({}, config.mochaOpts, config.capabilities[ 'mochaOpts' ]);

                return new MochaTestFramework(mochaConfig);
            default:
                throw new Error('Handle this better');
        }
    }

    private waitForOtherProtractorPlugins = () => Promise.resolve(this.config.onComplete || noop);

    private defaultConfig = (): SerenityFrameworkConfig => ({
        serenity: {
            crew: [ jsonReporter() ],
        },
    })
}
