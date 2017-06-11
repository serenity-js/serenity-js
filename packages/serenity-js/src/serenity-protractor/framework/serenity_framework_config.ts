import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { Config } from 'protractor';

import { CucumberConfig } from '../../serenity-cucumber/cucumber_test_framework';
import { MochaConfig } from '../../serenity-mocha';

export interface SerenityFrameworkConfig extends Config {
    serenity?: {
        crew?: StageCrewMember[];
        dialect?: 'cucumber' | 'mocha';
    };

    cucumberOpts?: CucumberConfig;
    mochaOpts?: MochaConfig;
}
