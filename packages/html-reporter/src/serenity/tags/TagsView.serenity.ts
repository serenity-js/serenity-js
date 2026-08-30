import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Click, type PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';

/**
 * Interaction object representing the **Tags** view in the HTML report.
 *
 * Groups scenarios by tag type (e.g. `@feature`, `@issue`, `@browser`) with cards
 * showing pass/fail counts for each tag value. Supports searching and filtering
 * to narrow the displayed tag cards.
 *
 * Composes child interaction objects ({@link SearchInput}, {@link FilterBar},
 * {@link ResultCount}) for individual UI widgets.
 *
 * On mobile viewports, search and filter controls live inside a bottom sheet. The same
 * `find()` and `selectFilter()` methods work regardless of viewport size when the
 * `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { TagsView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const tagsView = new TagsView(
 *   PageElement.located(By.css('[data-testid="tags"]')).describedAs('tags view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   tagsView.open(),
 *   Ensure.that(tagsView.tagCount(), isGreaterThan(0)),
 *   Ensure.that(tagsView.groupHeadings(), contain('Feature')),
 *   tagsView.selectTag('@checkout'),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class TagsView<NET> extends InteractionObject<NET> {

    readonly searchInput = new SearchInput<NET>(this.rootElement.element(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.rootElement.element(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.rootElement.element(By.css('[data-testid="result-count"]')));

    // Structure — mobile child interaction objects
    private readonly mobileSearchInput = new SearchInput<NET>(
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] [data-testid="search-input"]'))
    );

    private readonly mobileFilterBar = new FilterBar<NET>(
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] [data-testid="filter-bar"]'))
    );

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation = new Navigation(),
        options?: InteractionObjectOptions,
    ) {
        super(rootElement, options);
    }

    // Mobile helpers

    private filterSheetTrigger = () =>
        this.rootElement.element(By.css('[aria-label="Search and filter"]'))
            .describedAs('filter sheet trigger');

    private bottomSheetClose = () =>
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close'))
            .describedAs('bottom sheet close button');

    private openFilterSheet = (): Task =>
        Task.where('#actor opens the filter sheet',
            Click.on(this.filterSheetTrigger()),
        );

    private closeFilterSheet = (): Task =>
        Task.where('#actor closes the filter sheet',
            Click.on(this.bottomSheetClose()),
        );

    // Behaviour — questions

    private tagCards = () =>
        this.rootElement.elements(By.css('.tag-card'))
            .describedAs('tag cards');

    private groupHeaders = () =>
        this.rootElement.elements(By.css('.grid-section-header'))
            .describedAs('tag group headers');

    /**
     * The number of tag cards currently visible.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(tagsView.tagCount(), equals(12))
     * ```
     */
    tagCount = (): Question<Promise<number>> =>
        this.tagCards().count().describedAs('number of tag cards');

    /**
     * The display names of all currently visible tag cards.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(tagsView.tagNames(), contain('@checkout'))
     * ```
     */
    tagNames = (): Question<Promise<string[]>> =>
        this.rootElement.elements(By.css('.tag-card .tag-card-name'))
            .eachMappedTo(Text)
            .describedAs('tag card names');

    /**
     * The group heading labels (e.g. `'Feature'`, `'Issue'`, `'Browser'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(tagsView.groupHeadings(), equals(['Feature', 'Issue']))
     * ```
     */
    groupHeadings = (): Question<Promise<string[]>> =>
        this.groupHeaders()
            .eachMappedTo(Text)
            .describedAs('tag group headings');

    /**
     * The full rendered text of a specific tag card (includes name and counts).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(tagsView.tagCardText('@checkout'), includes('5 passed'))
     * ```
     *
     * @param name
     *  Substring to match against tag card text
     */
    tagCardText = (name: string): QuestionAdapter<string> =>
        this.tagCards()
            .where(Text, includes(name))
            .first()
            .describedAs(`tag card "${name}"`)
            .text()
            .describedAs(`text of tag card "${name}"`);

    /**
     * Clicks a tag card to navigate to its associated scenario list.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   tagsView.selectTag('@checkout'),
     * );
     * ```
     *
     * @param name
     *  Substring to match against tag card text
     */
    selectTag = (name: Answerable<string>): Task =>
        Task.where(the`#actor selects the ${name} tag`,
            Click.on(this.tagCards()
                .where(Text, includes(name))
                .first()
                .describedAs(the`tag card ${name}`)
            ),
        );

    /**
     * Searches for tags by entering text into the search input.
     *
     * On mobile viewports, opens the bottom sheet to access the search input.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   tagsView.find('checkout'),
     *   Ensure.that(tagsView.tagCount(), equals(1)),
     * );
     * ```
     *
     * @param searchTerm
     *  Text to search for (matches tag names)
     */
    find = (searchTerm: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor searches for ${searchTerm}`,
                this.openFilterSheet(),
                this.mobileSearchInput.searchFor(searchTerm),
                this.closeFilterSheet(),
            )
            : Task.where(the`#actor searches for ${searchTerm}`,
                this.searchInput.searchFor(searchTerm),
            );

    /**
     * Activates a filter chip by label (e.g. `'Feature'`, `'Issue'`).
     *
     * On mobile viewports, opens the bottom sheet to access filters.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   tagsView.selectFilter('Feature'),
     *   Ensure.that(tagsView.tagCount(), isGreaterThan(0)),
     * );
     * ```
     *
     * @param label
     *  The filter chip label to activate
     */
    selectFilter = (label: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor selects the ${label} filter`,
                this.openFilterSheet(),
                this.mobileFilterBar.selectFilter(label),
                this.closeFilterSheet(),
            )
            : this.filterBar.selectFilter(label);

    /**
     * The displayed result count text.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(tagsView.resultCountText(), includes('12 tags'))
     * ```
     */
    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    /**
     * Navigates to the Tags view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   tagsView.open(),
     *   Ensure.that(tagsView.tagCount(), isGreaterThan(0)),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Tags view',
            this.navigation.openView('Tags'),
        );
}
