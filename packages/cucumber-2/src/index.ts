import { Config } from 'serenity-js/lib/serenity-protractor/framework/config';
import { CucumberAdapter } from './cucumber_adapter';
import { CucumberOptions } from './cucumber_options';

export = (config: Config<CucumberOptions>) => new CucumberAdapter(config);
