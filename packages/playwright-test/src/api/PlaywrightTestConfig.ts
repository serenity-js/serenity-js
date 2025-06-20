import type { PlaywrightTestConfig as BasePlaywrightTestConfig } from '@playwright/test';

import type { SerenityFixtures, SerenityWorkerFixtures } from './serenity-fixtures';

/**
 * Convenience alias for [PlaywrightTestConfig](https://playwright.dev/docs/test-configuration) object
 * that includes [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/) and
 * [`SerenityWorkerFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/) and allows for any other custom options when needed.
 *
 * #### Example
 * Configuring Playwright Test using the standard `PlaywrightTestConfig` from `@playwright/test`:
 *
 * ```typescript
 * // playwright.config.ts
 * import type { PlaywrightTestConfig } from '@playwright/test'
 * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test'
 *
 * const config: PlaywrightTestConfig<SerenityFixtures & MyCustomOptions, SerenityWorkerFixtures> = {
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
 * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 * - [`SerenityWorkerFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/)
 * - [`SerenityReporterForPlaywrightTestConfig`](https://serenity-js.org/api/playwright-test/interface/SerenityReporterForPlaywrightTestConfig/)
 * - [Playwright Test configuration](https://playwright.dev/docs/test-configuration)
 */
export type PlaywrightTestConfig<TestArgs = object, WorkerArgs = object> = BasePlaywrightTestConfig<SerenityFixtures & TestArgs, SerenityWorkerFixtures & WorkerArgs>;
