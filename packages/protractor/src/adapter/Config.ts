import { SerenityConfig } from '@serenity-js/core';
import { Config as ProtractorConfig } from 'protractor';

export interface Config extends ProtractorConfig {
    serenity: SerenityConfig & { runner?: string };
}
