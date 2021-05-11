import { TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { Config as ProtractorConfig } from 'protractor';
import { TestRunnerLoader } from './TestRunnerLoader';

/**
 * @desc
 *  Detects the {@link @serenity-js/core/lib/io~TestRunnerAdapter} to use,
 *  based on Protractor configuration.
 *
 * @public
 */
export class TestRunnerDetector {

    static cucumberOpts = 'cucumberOpts';
    static jasmineNodeOpts = 'jasmineNodeOpts';
    static mochaOpts = 'mochaOpts';

    static protractorCliOptions(): string[] {
        return [
            TestRunnerDetector.cucumberOpts,
            TestRunnerDetector.jasmineNodeOpts,
            TestRunnerDetector.mochaOpts,
        ];
    }

    /**
     * @param {TestRunnerLoader} testRunnerLoader
     */
    constructor(private readonly testRunnerLoader: TestRunnerLoader) {
    }

    /**
     * @param {protractor~ProtractorConfig} config
     * @returns {TestRunnerAdapter}
     */
    runnerFor(config: ProtractorConfig): TestRunnerAdapter {

        const
            specifiesRunnerFor = (type: string) =>
                !!config.serenity &&
                !!config.serenity.runner &&
                config.serenity.runner === type;

        switch (true) {
            case specifiesRunnerFor('cucumber'):
                return this.useCucumber(config);
            case specifiesRunnerFor('jasmine'):
                return this.useJasmine(config);
            case specifiesRunnerFor('mocha'):
                return this.useMocha(config);
            case !! config.cucumberOpts:
                return this.useCucumber(config);
            case !! config.mochaOpts:
                return this.useMocha(config);
            case !! config.jasmineNodeOpts:
            default:
                return this.useJasmine(config);
        }
    }

    private useJasmine(config: ProtractorConfig): TestRunnerAdapter {
        return this.testRunnerLoader.forJasmine(this.mergedConfigFor(config, TestRunnerDetector.jasmineNodeOpts));
    }

    private useMocha(config: ProtractorConfig): TestRunnerAdapter {
        return this.testRunnerLoader.forMocha(this.mergedConfigFor(config, TestRunnerDetector.mochaOpts));
    }

    private useCucumber(config: ProtractorConfig): TestRunnerAdapter {

        const serenityReportingServicesConfigured  = config?.serenity?.crew?.length > 0;

        return this.testRunnerLoader.forCucumber(this.mergedConfigFor(config, TestRunnerDetector.cucumberOpts), {
            useStandardOutput:      serenityReportingServicesConfigured,
            uniqueFormatterOutputs: this.multiCapabilitiesOrTestShardingEnabled(config),
        })
    }

    private mergedConfigFor<K extends keyof ProtractorConfig>(config: ProtractorConfig = {}, key: K): ProtractorConfig[K] {

        return Object.assign(
            {},
            config[key],
            (config.capabilities || {})[key],
        );
    }

    private multiCapabilitiesOrTestShardingEnabled(config: ProtractorConfig): boolean {
        return !! (
            (Array.isArray(config.multiCapabilities) && config.multiCapabilities.length > 0)
            || typeof config.getMultiCapabilities === 'function'
            || config.capabilities?.shardTestFiles
        );
    }
}
