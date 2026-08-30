import { equals, includes } from '@serenity-js/assertions';
import type { Answerable, Question } from '@serenity-js/core';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, Text, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

/**
 * Interaction object representing a bar of toggle filter chips used to narrow
 * results by outcome (Passed, Failed, Pending, etc.).
 *
 * A `FilterBar` is composed into views like {@link ScenariosView}, `ConsistencyView`,
 * and `TagsView`. It is not instantiated directly by tests — instead, views expose
 * delegating methods like `selectFilter()` at the view level. The `FilterBar` instance
 * itself is accessible for **component tests** that exercise the filter chip API in isolation.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { FilterBar } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class MyView<NET> extends InteractionObject<NET> {
 *   readonly filterBar = new FilterBar(this.rootElement.element(By.css('[data-testid="filter-bar"]')));
 * }
 * ```
 *
 * ## Usage in a component test
 *
 * ```ts
 * await actor.attemptsTo(
 *   filterBar.selectFilter('Failed'),
 *   Ensure.that(filterBar.activeFilters(), equals(['Failed'])),
 *   Ensure.that(filterBar.filterLabels(), equals(['All', 'Passed', 'Failed', 'Pending', 'Skipped'])),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class FilterBar<NET> extends InteractionObject<NET> {

    private chips = () =>
        this.rootElement.elements(By.css('.filter-chip'))
            .describedAs('filter chips');

    private chipLabel = () =>
        PageElement.located(By.css('.chip-label'));

    private labelElement = () =>
        this.rootElement.element(By.css('span.label-upper'))
            .describedAs('filter bar label');

    private sortSelect = () =>
        this.rootElement.element(By.css('.sort-select'))
            .describedAs('sort dropdown');

    /**
     * The labels of all filter chips in the bar (e.g. `['All', 'Passed', 'Failed', 'Pending']`).
     *
     * Returns the visible text of every chip regardless of its pressed state.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(filterBar.filterLabels(), equals(['All', 'Passed', 'Failed', 'Pending', 'Skipped'])),
     * );
     * ```
     */
    filterLabels = (): Question<Promise<string[]>> =>
        this.chips()
            .eachMappedTo(Text.of(this.chipLabel()))
            .describedAs('filter chip labels');

    /**
     * The labels of currently pressed (active) filter chips.
     *
     * Only returns chips where `aria-pressed="true"`, indicating
     * the filter is actively narrowing results.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   filterBar.selectFilter('Failed'),
     *   Ensure.that(filterBar.activeFilters(), equals(['Failed'])),
     * );
     * ```
     */
    activeFilters = (): Question<Promise<string[]>> =>
        this.chips()
            .where(Attribute.called('aria-pressed'), equals('true'))
            .eachMappedTo(Text.of(this.chipLabel()))
            .describedAs('active filter labels');

    /**
     * Clicks a filter chip by its label text to toggle the filter on or off.
     *
     * Uses PEQL substring matching — the label doesn't need to be an exact match.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   filterBar.selectFilter('Failed'),
     *   Ensure.that(filterBar.activeFilters(), equals(['Failed'])),
     * );
     * ```
     *
     * @param label
     *  The filter chip label to click (e.g. `'Failed'`, `'Passed'`, `'Pending'`)
     */
    selectFilter = (label: Answerable<string>): Task =>
        Task.where(the`#actor selects the ${label} filter`,
            Click.on(this.chips()
                .where(Text.of(this.chipLabel()), includes(label))
                .first()
                .describedAs(the`filter chip ${label}`)
            ),
        );

    /**
     * The current value of the sort dropdown (e.g. `'name'`, `'duration'`, `'outcome'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(filterBar.selectedSort(), equals('name')),
     * );
     * ```
     */
    selectedSort = (): QuestionAdapter<string> =>
        Value.of(this.sortSelect())
            .describedAs('selected sort option');

    /**
     * The filter bar's heading text (e.g. `'FILTER BY OUTCOME'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(filterBar.label(), equals('FILTER BY OUTCOME')),
     * );
     * ```
     */
    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('filter bar label');
}
