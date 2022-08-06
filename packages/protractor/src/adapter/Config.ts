import { SerenityConfig } from '@serenity-js/core';
import { Config as ProtractorConfig } from 'protractor';

/**
 * Protractor configuration object with an additional
 * section to configure the Serenity/JS framework.
 *
 * ## Learn more
 * - [Protractor config](https://github.com/angular/protractor/blob/master/lib/config.ts)
 * - {@link SerenityConfig}
 * - [[configure]]
 *
 * @group Configuration
 */
export interface Config extends ProtractorConfig {
    /**
     * See {@link SerenityConfig}
     */
    serenity: SerenityConfig & { runner?: string };
}
