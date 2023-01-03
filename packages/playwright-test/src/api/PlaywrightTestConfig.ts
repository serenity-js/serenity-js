import type { PlaywrightTestConfig as BasePlaywrightTestConfig } from '@playwright/test';

import { SerenityOptions } from './SerenityOptions';

/**
 * Convenience alias for [PlaywrightTestConfig](https://playwright.dev/docs/test-configuration) object
 * that includes {@apilink SerenityOptions} and allows for any other custom options when needed.
 *
 * #### Example
 * Configuring Playwright Test using the standard `PlaywrightTestConfig` from `@playwright/test`:
 *
 * ```typescript
 * // playwright.config.ts
 * import type { PlaywrightTestConfig } from '@playwright/test'
 * import type { SerenityOptions } from '@serenity-js/playwright-test'
 *
 * const config: PlaywrightTestConfig<SerenityOptions & MyCustomOptions> = {
 *     // ...
 * }
 *
 * export default config
 * ```
 *
 * Simplified configuration using Serenity/JS `PlaywrightTestConfig` from `@serenity-js/playwright-test`:
 *
 * ```typescript
 * // playwright.config.ts
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
 *
 * const config: PlaywrightTestConfig<MyCustomOptions> = {
 *    // ...
 * }
 * export default config
 * ```
 *
 * #### Learn more
 * - {@apilink SerenityOptions}
 * - {@apilink SerenityFixtures}
 * - {@apilink SerenityReporterForPlaywrightTestConfig}
 * - [Playwright Test configuration](https://playwright.dev/docs/test-configuration)
 */
export type PlaywrightTestConfig<TestArgs = object, WorkerArgs = object> = BasePlaywrightTestConfig<SerenityOptions & TestArgs, WorkerArgs>;
