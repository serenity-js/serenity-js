import type { Answerable, Question,QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, Enter, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

/**
 * Interaction object representing a text search input with a clear affordance.
 *
 * A `SearchInput` is composed into views that support text-based filtering
 * (e.g. {@link ScenariosView}, `ConsistencyView`, `ErrorsView`). Like {@link FilterBar},
 * it is not instantiated directly by integration tests — views expose delegating methods
 * such as `find()` at the view level. The `SearchInput` instance is accessible for
 * **component tests** that exercise the input widget in isolation.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { SearchInput } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class MyView<NET> extends InteractionObject<NET> {
 *   readonly searchInput = new SearchInput(this.rootElement.element(By.css('[data-testid="search-input"]')));
 * }
 * ```
 *
 * ## Usage in a component test
 *
 * ```ts
 * await actor.attemptsTo(
 *   searchInput.searchFor('checkout'),
 *   Ensure.that(searchInput.value(), equals('checkout')),
 *   Ensure.that(searchInput.isClearable(), equals(true)),
 *
 *   searchInput.clear(),
 *   Ensure.that(searchInput.value(), equals('')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class SearchInput<NET> extends InteractionObject<NET> {

    private inputField = () =>
        this.rootElement.element(By.css('.search-input'))
            .describedAs('search input field');

    private clearButton = () =>
        this.rootElement.element(By.css('.btn-clear'))
            .describedAs('clear search button');

    /**
     * The current value of the search input field.
     *
     * Returns the text the user has typed (or that was programmatically filled),
     * even if filtering hasn't yet updated the results.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   searchInput.searchFor('checkout'),
     *   Ensure.that(searchInput.value(), equals('checkout')),
     * );
     * ```
     */
    value = (): QuestionAdapter<string> =>
        Value.of(this.inputField())
            .describedAs('search input value');

    /**
     * The placeholder text of the search input (e.g. `'Search scenarios...'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(searchInput.placeholder(), equals('Search scenarios...')),
     * );
     * ```
     */
    placeholder = (): QuestionAdapter<string> =>
        Attribute.called('placeholder').of(this.inputField())
            .describedAs('search input placeholder');

    /**
     * The `aria-label` attribute of the search input, describing its purpose
     * to assistive technology.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(searchInput.label(), equals('Search test scenarios')),
     * );
     * ```
     */
    label = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.inputField())
            .describedAs('search input label');

    /**
     * Whether the clear button is present in the DOM.
     *
     * The clear button typically appears only when the input contains text,
     * providing a one-click way to reset the search.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   searchInput.searchFor('checkout'),
     *   Ensure.that(searchInput.isClearable(), equals(true)),
     *
     *   searchInput.clear(),
     *   Ensure.that(searchInput.isClearable(), equals(false)),
     * );
     * ```
     */
    isClearable = (): Question<Promise<boolean>> =>
        this.clearButton().isPresent()
            .describedAs('whether search input is clearable');

    /**
     * Types text into the search input field, triggering the view's
     * text-based filtering.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   searchInput.searchFor('expired card'),
     *   Ensure.that(searchInput.value(), equals('expired card')),
     * );
     * ```
     *
     * @param searchTerm
     *  Text to type into the search field
     */
    searchFor = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${ searchTerm }`,
            Enter.theValue(searchTerm).into(this.inputField()),
        );

    /**
     * Clicks the clear button to reset the search input to empty.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   searchInput.searchFor('checkout'),
     *   searchInput.clear(),
     *   Ensure.that(searchInput.value(), equals('')),
     * );
     * ```
     */
    clear = (): Task =>
        Task.where(`#actor clears the search input`,
            Click.on(this.clearButton()),
        );
}
