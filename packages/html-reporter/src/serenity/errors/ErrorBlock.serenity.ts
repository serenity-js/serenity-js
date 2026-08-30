import type { Question, QuestionAdapter } from '@serenity-js/core';
import { By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

/**
 * Interaction object representing an **error display block** in the scenario detail view.
 *
 * Shows the error name (type), message, and stack trace for a failed scenario.
 * Obtained via {@link ScenarioDetailView.errorBlock} — not instantiated directly in tests.
 *
 * ```ts
 * const errorBlock = scenarioDetailView.errorBlock();
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(scenarioDetailView.hasError(), equals(true)),
 *   Ensure.that(scenarioDetailView.errorBlock().name(), equals('AssertionError')),
 *   Ensure.that(scenarioDetailView.errorBlock().message(), includes('expected true to equal false')),
 *   Ensure.that(scenarioDetailView.errorBlock().stackTrace(), includes('checkout.spec.ts')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ErrorBlock<NET> extends InteractionObject<NET> {

    private errorName = () =>
        this.rootElement.element(By.css('.error-name'))
            .describedAs('error name');

    private errorMessage = () =>
        this.rootElement.element(By.css('.error-message'))
            .describedAs('error message');

    private errorStack = () =>
        this.rootElement.element(By.css('.error-stack'))
            .describedAs('error stack trace');

    /**
     * The error type/class name (e.g. `'AssertionError'`, `'TimeoutError'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorBlock.name(), equals('AssertionError'))
     * ```
     */
    name = (): QuestionAdapter<string> =>
        this.errorName().text().trim()
            .describedAs('error name');

    /**
     * The error message text.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorBlock.message(), includes('expected true to equal false'))
     * ```
     */
    message = (): QuestionAdapter<string> =>
        this.errorMessage().text().trim()
            .describedAs('error message');

    /**
     * The full stack trace text rendered in the error block.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorBlock.stackTrace(), includes('checkout.spec.ts:42'))
     * ```
     */
    stackTrace = (): QuestionAdapter<string> =>
        this.errorStack().text().trim()
            .describedAs('error stack trace');

    /**
     * Whether the error block displays a source location with a copy affordance.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorBlock.hasLocation(), equals(true))
     * ```
     */
    hasLocation = (): Question<Promise<boolean>> =>
        this.rootElement.element(By.css('.copy-location'))
            .isPresent()
            .describedAs('whether error block shows a source location');
}
