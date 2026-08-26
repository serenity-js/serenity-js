import { includes } from '@serenity-js/assertions';
import type { Answerable, Question } from '@serenity-js/core';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Click, PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { HistoryDots } from '../common/HistoryDots.serenity.js';
import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { OutcomeBadge } from '../common/OutcomeBadge.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

/**
 * Interaction object representing the **Consistency** view in the HTML report.
 *
 * Identifies tests with inconsistent execution patterns: flaky tests (pass only via retry),
 * degraded tests (newly broken), inconsistent tests (retry masking deeper problems), and
 * recovered tests (previously broken, now passing cleanly). Each scenario row shows
 * a history dot strip visualising its outcome across recent runs.
 *
 * Composes child interaction objects ({@link SearchInput}, {@link FilterBar},
 * {@link ResultCount}, {@link HistoryDots}) for individual UI widgets.
 *
 * On mobile viewports, search and filter controls live inside a bottom sheet. The same
 * `find()` and `selectFilter()` methods work regardless of viewport size when the
 * `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { ConsistencyView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const consistencyView = new ConsistencyView(
 *   PageElement.located(By.css('[data-testid="consistency"]')).describedAs('consistency view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   consistencyView.open(),
 *   consistencyView.selectFilter('Flaky'),
 *   Ensure.that(consistencyView.scenarioCount(), isGreaterThan(0)),
 *   Ensure.that(consistencyView.scenarioNames(), contain('Flaky Test A')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ConsistencyView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));
    readonly historyDots = new HistoryDots<NET>(this.child(By.css('[data-testid="history-dots"]')));

    // Structure — mobile child interaction objects
    private readonly mobileSearchInput = new SearchInput<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="search-input"]'))
    );

    private readonly mobileFilterBar = new FilterBar<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="filter-bar"]'))
    );

    // Structure — page elements
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('consistency scenario items');
    private readonly scenarioNameElements = this.children(ConsistencyView.scenarioNameSelector).describedAs('consistency scenario names');

    constructor(
        rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>,
        private readonly navigation: Navigation = new Navigation(),
        options?: InteractionObjectOptions,
    ) {
        super(rootElement, options);
    }

    // Mobile helpers

    private filterSheetTrigger = () =>
        this.child(By.css('[aria-label="Search and filter"]'))
            .describedAs('filter sheet trigger');

    private bottomSheetClose = () =>
        this.child(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close'))
            .describedAs('bottom sheet close button');

    private openFilterSheet = (): Task =>
        Task.where('#actor opens the filter sheet',
            Click.on(this.filterSheetTrigger()),
        );

    private closeFilterSheet = (): Task =>
        Task.where('#actor closes the filter sheet',
            Click.on(this.bottomSheetClose()),
        );

    // Behaviour — questions (what the user observes)

    /**
     * Returns an {@link OutcomeBadge} interaction object for the given scenario item element.
     *
     * ## Example
     *
     * ```ts
     * const badge = consistencyView.outcomeBadgeFor(scenarioElement);
     * ```
     *
     * @param scenarioItem
     *  The page element representing a scenario row
     */
    outcomeBadgeFor = (scenarioItem: Answerable<PageElement<NET>>): OutcomeBadge<NET> =>
        new OutcomeBadge<NET>(PageElement.located<NET>(By.css('[data-testid="outcome-badge"]')).of(scenarioItem));

    /**
     * The number of scenario rows currently visible in the consistency list.
     *
     * Reflects the current filter and search state.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   consistencyView.selectFilter('Flaky'),
     *   Ensure.that(consistencyView.scenarioCount(), equals(3)),
     * );
     * ```
     */
    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems.count().describedAs('number of consistency scenarios');

    /**
     * Locates a scenario by name and returns a {@link ScenarioItem} interaction object
     * for inspecting its state.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(consistencyView.scenarioCalled('Flaky Test').outcome(), equals('RETRIED_SUCCESS'))
     * ```
     *
     * @param name
     *  Substring to match against scenario names
     */
    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ConsistencyView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`consistency scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    /**
     * The display names of all currently visible scenarios in the consistency list.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(consistencyView.scenarioNames(), contain('Flaky Test A'))
     * ```
     */
    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('consistency scenario names');

    /**
     * The full body text of the consistency view.
     *
     * Useful for checking empty states or overall content.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(consistencyView.bodyText(), includes('No inconsistent tests'))
     * ```
     */
    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('consistency view text');

    // Behaviour — tasks (what the user does)

    /**
     * Searches for scenarios by entering text into the search input.
     *
     * On mobile viewports, opens the bottom sheet to access the search input.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   consistencyView.find('checkout'),
     *   Ensure.that(consistencyView.scenarioCount(), equals(1)),
     * );
     * ```
     *
     * @param searchTerm
     *  Text to search for (matches scenario names)
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
     * Activates a filter chip by label (e.g. `'Flaky'`, `'Degraded'`, `'Recovered'`).
     *
     * On mobile viewports, opens the bottom sheet to access filters.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   consistencyView.selectFilter('Flaky'),
     *   Ensure.that(consistencyView.scenarioCount(), equals(3)),
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
     * Navigates to the Consistency view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   consistencyView.open(),
     *   Ensure.that(consistencyView.scenarioCount(), isGreaterThan(0)),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Consistency view',
            this.navigation.openView('Consistency'),
        );
}
