import { SerenityConfig } from 'serenity-js/lib/serenity/serenity';
import { CucumberAdapter } from './cucumber_adapter';
import { CucumberOptions } from './cucumber_options';

export = (config: SerenityConfig<CucumberOptions>) => new CucumberAdapter(config);
