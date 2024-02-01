
/**
 * Configuration options for the {@link SerenityBDDReporter}.
 *
 * @group Stage
 */
export interface SerenityBDDReporterConfig {
    /**
     * The root directory that {@link SerenityBDDReporter} should recursively scan for test scenario files
     * to determine the [requirements hierarchy](https://serenity-bdd.github.io/docs/reporting/living_documentation#the-requirements-hierarchy),
     * relative to the current working directory.
     *
     * If not specified, `specDirectory` defaults to the first one of the following subdirectories that's present in the current working
     * directory:
     * - `features` - typically used by [Serenity/JS + Cucumber.js](/handbook/test-runners/cucumber/) projects to store `.feature` files
     * - `specs` - typically used by [Serenity/JS + Jasmine](/handbook/test-runners/jasmine/) and [Mocha](/handbook/test-runners/mocha/) projects to store `.spec.js` or `.spec.ts` files
     * - `spec` - another popular naming convention seen in [Serenity/JS + Jasmine](/handbook/test-runners/jasmine/) and [Mocha](/handbook/test-runners/mocha/) projects
     * - `tests` - typically used by [Serenity/JS + Playwright Test](/handbook/test-runners/playwright-test/) projects to store `.spec.ts` files
     * - `test` - typically used by [Serenity/JS + WebdriverIO](/handbook/test-runners/webdriverio/) projects to store `.spec.ts` files
     * - `src` - typically used by [Serenity/JS + Playwright Component Test](/api/playwright-test/#ui-component-testing) projects to store `.spec.ts` files alongside the source code
     *
     * If not specified and none of the above subdirectories are present, `specDirectory` defaults to the current working directory.
     *
     * If `specDirectory` _is_ specified, but the directory doesn't exist, SerenityBDDReporter throws a {@link ConfigurationError}.
     *
     * **IMPORTANT**: For the Serenity BDD CLI Reporter to correctly parse the requirements hierarchy and recognise your test scenarios,
     * your test scenario files must be named using either:
     * - `<feature name>.feature` naming convention for Cucumber.js projects
     * - `<feature name>.<suffix>.<extension>` naming convention for non-Cucumber.js projects
     *
     * In the naming conventions above:
     * - `<feature name>` is the name of the feature or component the scenario exercises; e.g. `checkout.feature`, `checkout.spec.ts`, `LoginForm.spec.ts`
     * - `<suffix>` is one of the following: `spec`, `test`, `integration`, `it`, `e2e`, `spec.e2e`, `spec-e2e`; e.g. `checkout.spec.ts`, `payments.spec-e2e.ts`, `user_registration.integration.ts`
     * - `<extension>` is one of the following: `js`, `jsx`, `mjs`, `mjsx`, `cjs`, `cjsx`, `ts`, `tsx`, `mts`, `mtsx`, `cts`, `ctxs`; e.g. `authentication.spec.ts`, `FormValidator.spec.mtsx`
     *
     * To find out more about how [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli) parses the requirements hierarchy,
     * see the [SpecFileFilters](https://github.com/serenity-bdd/serenity-core/blob/main/serenity-model/src/main/java/net/thucydides/model/requirements/SpecFileFilters.java)
     * class.
     */
    specDirectory?: string;
}
