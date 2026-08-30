import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

/**
 * Structured data representing a single history dot's outcome and tooltip.
 *
 * Returned by {@link HistoryDots.outcomes} as an array, where each entry
 * corresponds to one dot in the history strip (ordered from oldest to newest).
 *
 * ## Example assertion
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(historyDots.outcomes().as(entries => entries[0].type), equals('SUCCESS')),
 *   Ensure.that(historyDots.outcomes().as(entries => entries[0].title), includes('Passed')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export interface HistoryDotEntry {
    type: string;
    title: string;
}

class HistoryDotOutcome {
    static of = <NET>(dot: PageElement<NET>) =>
        Question.fromObject({
            type: Attribute.called('data-outcome').of(dot),
            title: Attribute.called('title').of(dot),
        }).describedAs('history dot outcome');
}

/**
 * Interaction object representing a strip of history dots showing the pass/fail
 * pattern across recent test runs.
 *
 * Each dot carries an outcome type (`data-outcome` attribute) and a tooltip title
 * describing the run result. The strip provides a visual timeline of scenario stability,
 * making it easy to spot flaky tests or recent regressions at a glance.
 *
 * History dots appear on scenario rows in the Test Scenarios view and in the
 * Scenario Detail view's execution history section.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { HistoryDots } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class ScenarioItem<NET> extends InteractionObject<NET> {
 *   readonly historyDots = new HistoryDots(this.rootElement.element(By.css('[data-testid="history-dots"]')));
 * }
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(historyDots.count(), equals(5)),
 *   Ensure.that(historyDots.outcomes().as(entries => entries[0].type), equals('SUCCESS')),
 *   Ensure.that(historyDots.outcomes().as(entries => entries[4].type), equals('FAILURE')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class HistoryDots<NET> extends InteractionObject<NET> {

    private dots = () =>
        this.rootElement.elements(By.css('.history-dot'))
            .describedAs('history dots');

    /**
     * The number of history dots in the strip.
     *
     * Corresponds to the number of historical runs available for this scenario.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(historyDots.count(), equals(5)),
     * );
     * ```
     */
    count = (): QuestionAdapter<number> =>
        this.dots().count()
            .describedAs('number of history dots');

    /**
     * A structured array of `{type, title}` entries for each dot, ordered
     * from oldest to newest.
     *
     * Each entry's `type` is the `data-outcome` attribute value (e.g. `'SUCCESS'`,
     * `'FAILURE'`, `'RETRIED_SUCCESS'`) and `title` is the tooltip text describing
     * the run result.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(historyDots.outcomes().as(entries => entries[0].type), equals('SUCCESS')),
     *   Ensure.that(historyDots.outcomes().as(entries => entries[1].title), includes('Passed on retry')),
     * );
     * ```
     */
    outcomes = (): Question<Promise<HistoryDotEntry[]>> =>
        this.dots()
            .eachMappedTo(HistoryDotOutcome)
            .describedAs('outcomes of history dots');
}
