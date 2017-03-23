import { CucumberTestFramework } from '../../serenity-cucumber/cucumber_test_framework';
import { MochaTestFramework } from '../../serenity-mocha';
import { SerenityFrameworkConfig } from './serenity_framework_config';
import { TestFrameworkAdapter } from './test_framework_adapter';

export class TestFrameworkDetector {

    frameworkFor(config: SerenityFrameworkConfig): TestFrameworkAdapter {
        if (this.definesDialect(config)) {
            return this.tryToInstantiate(config.serenity.dialect.toLowerCase(), config);
        }

        if (this.defines('cucumberOpts', config)) {
            return this.tryToInstantiate('cucumber', config);
        }

        if (this.defines('mochaOpts', config)) {
            return this.tryToInstantiate('mocha', config);
        }

        throw new Error(
            'Serenity/JS could not determine the test dialect you wish to use. ' +
            'Please add `serenity: { dialect: \'...\' }` to your Protractor configuration file ' +
            'and choose one of the following options: cucumber, mocha.',
        );
    }

    supportedCLIParams = () => [
        'mochaOpts',
        'cucumberOpts',
    ];

    private definesDialect(config: SerenityFrameworkConfig) {
        return config.serenity && config.serenity.dialect;
    }

    private defines(property: string, config: SerenityFrameworkConfig) {
        const empty = (object: any) => Object.getOwnPropertyNames(object).length === 0;

        return ! empty(this.full(config, property));
    }

    private tryToInstantiate(dialect: string, config: SerenityFrameworkConfig) {
        switch (dialect) {
            case 'cucumber': return new CucumberTestFramework(config.configDir, this.full(config, 'cucumberOpts'));
            case 'mocha':    return new MochaTestFramework(this.full(config, 'mochaOpts'));
            default:         throw new Error(
                `Serenity/JS does not (yet) support the '${ dialect }' test framework. ` +
                'Please let us know on github if you\'d like to see it added!',
            );
        }
    }

    private full = (config: SerenityFrameworkConfig, configSection: string) => Object.assign(
        {},
        config[configSection],
        config.capabilities && config.capabilities[ configSection ],
    )
}
