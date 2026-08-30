import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Attribute, type PageElement, Text } from '@serenity-js/web';

/**
 * Interaction object representing an outcome badge icon showing the execution result
 * of a test scenario (passed, failed, pending, etc.).
 *
 * Unlike most interaction objects in the HTML reporter, `OutcomeBadge` does **not**
 * extend {@link InteractionObject} — it takes a root element directly. This keeps it
 * lightweight for embedding inside other interaction objects like {@link ScenarioItem}
 * or `ActivityItem`.
 *
 * The badge communicates outcome both visually (via an icon/colour) and semantically
 * (via the `data-outcome` attribute), making it accessible to both sighted users
 * and automated tests.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { OutcomeBadge } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class ScenarioItem<NET> extends InteractionObject<NET> {
 *   readonly badge = new OutcomeBadge(this.rootElement.element(By.css('[data-testid="outcome-badge"]')));
 * }
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(badge.outcomeType(), equals('FAILURE')),
 *   Ensure.that(badge.iconText(), equals('✗')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class OutcomeBadge<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    /**
     * The visible text of the outcome badge (typically an icon character
     * like `'✓'`, `'✗'`, `'⏸'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(badge.iconText(), equals('✗')),
     * );
     * ```
     */
    iconText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('outcome badge icon text');

    /**
     * The `data-outcome` attribute value representing the scenario's execution result
     * (e.g. `'SUCCESS'`, `'FAILURE'`, `'PENDING'`, `'SKIPPED'`, `'COMPROMISED'`, `'ERROR'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(badge.outcomeType(), equals('FAILURE')),
     * );
     * ```
     */
    outcomeType = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.rootElement)
            .describedAs('outcome type');
}
