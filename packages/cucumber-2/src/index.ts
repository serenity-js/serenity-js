import { SerenityConfig } from '@serenity-js/core';
import { CucumberAdapter } from './cucumber_adapter';
import { CucumberOptions } from './cucumber_options';

export = (config: SerenityConfig<CucumberOptions>) => new CucumberAdapter(config);
