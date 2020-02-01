import { SerenityConfig } from '@serenity-js/core';
import { Config as ProtractorConfig } from 'protractor';

/**
 * @desc
 *  Protractor configuration object with an additional
 *  section to configure the Serenity/JS framework.
 *
 * @public
 * @interface
 *
 * @see {@link @serenity-js/core~SerenityConfig}
 *
 * @see https://github.com/angular/protractor/blob/master/lib/config.ts
 * @see {@link @serenity-js/core~configure}
 */
export interface Config extends ProtractorConfig {
    serenity: SerenityConfig & { runner?: string };
}
