import type { SerenityConfig } from '@serenity-js/core';
import type { Config as ProtractorConfig } from 'protractor';

/**
 * Protractor configuration object with an additional
 * section to configure the Serenity/JS framework.
 *
 * ## Learn more
 * - [Protractor config](https://github.com/angular/protractor/blob/master/lib/config.ts)
 * - [`SerenityConfig`](https://serenity-js.org/api/core/class/SerenityConfig/)
 * - [`configure`](https://serenity-js.org/api/core/function/configure/)
 *
 * @group Configuration
 */
export interface Config extends ProtractorConfig {
    /**
     * See [`SerenityConfig`](https://serenity-js.org/api/core/class/SerenityConfig/)
     */
    serenity: SerenityConfig & { runner?: string };
}
