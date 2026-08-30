import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { type PageElement, Text } from '@serenity-js/web';

/**
 * Simple interaction object representing the displayed result count
 * (e.g. `'7 of 23 scenarios'`).
 *
 * Unlike most interaction objects in the HTML reporter, `ResultCount` does **not**
 * extend {@link InteractionObject} — it takes a root element directly and provides
 * a single Question for reading the count text.
 *
 * A `ResultCount` is composed into views like {@link ScenariosView} and is typically
 * accessed via the parent view's `resultCount` field or `resultCountText()` method.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { ResultCount } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class MyView<NET> extends InteractionObject<NET> {
 *   readonly resultCount = new ResultCount(this.rootElement.element(By.css('[data-testid="result-count"]')));
 * }
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(scenariosView.resultCount.text(), includes('7 of 23')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ResultCount<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    /**
     * The displayed result count text (e.g. `'7 of 23 scenarios'`, `'3 results'`).
     *
     * Reflects the current filter and search state of the parent view.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(resultCount.text(), includes('7 of 23')),
     * );
     * ```
     */
    text = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('result count text');
}
