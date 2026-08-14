import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Click, PageElement, PageElements, Text, Value } from '@serenity-js/web';

import type { OutcomeFilter } from '../../navigation/link.js';
import { link } from '../../navigation/link.js';
import { FilterBar } from '../common/FilterBar.serenity.js';
import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';
import { ScenarioItem } from './ScenarioItem.serenity.js';

/**
 * Interaction object representing the **Test Scenarios** view in the HTML report.
 *
 * Models the complete user workflow for finding, filtering, and inspecting test scenarios.
 * Composes child interaction objects ({@link SearchInput}, {@link FilterBar}, {@link ResultCount})
 * that handle individual UI widgets, while the view itself exposes the high-level actions
 * a user performs when navigating their test results.
 *
 * On mobile viewports, search and filter controls live inside a bottom sheet rather than
 * being always visible. The interaction object handles this transparently — the same
 * `find()` and `selectFilter()` methods work regardless of viewport size when the
 * `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { ScenariosView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const scenariosView = new ScenariosView(
 *   PageElement.located(By.css('[data-testid="tests"]')).describedAs('scenarios view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Wiring into a Playwright Test fixture
 *
 * ```ts
 * scenariosView: async ({ page, navigation }, use) => {
 *   const viewport = page.viewportSize();
 *   const options = { mobile: viewport ? viewport.width <= 768 : false };
 *   const rootElement = PageElement.located(By.css('[data-testid="tests"]'))
 *     .describedAs('scenarios view');
 *   await use(new ScenariosView(rootElement, navigation, options));
 * },
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   scenariosView.open(),
 *   scenariosView.selectFilter('Failed'),
 *   scenariosView.find('expired card'),
 *
 *   Ensure.that(scenariosView.scenarioCount(), equals(1)),
 *   Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
 *   Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ScenariosView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — child interaction objects

    /** The search input widget. Available for direct use in component tests. */
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));

    /** The filter chip bar. Available for direct use in component tests. */
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));

    /** The result count display. Available for direct use in component tests. */
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));

    // Structure — mobile child interaction objects
    private readonly mobileSearchInput = new SearchInput<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="search-input"]'))
    );

    private readonly mobileFilterBar = new FilterBar<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="filter-bar"]'))
    );

    // Structure — page elements
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('scenario items');
    private readonly scenarioNameElements = this.children(ScenariosView.scenarioNameSelector).describedAs('scenario names');

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

    // Behaviour — questions

    /**
     * The number of scenario rows currently visible in the list.
     *
     * Reflects the current filter and search state — if filters are active,
     * this returns only the count of matching scenarios.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.selectFilter('Failed'),
     *   Ensure.that(scenariosView.scenarioCount(), equals(7)),
     * );
     * ```
     */
    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems.count().describedAs('number of scenarios');

    /**
     * Locates a scenario by name and returns a {@link ScenarioItem} interaction object
     * for inspecting its state or performing actions on it.
     *
     * Uses PEQL substring matching — the name doesn't need to be an exact match.
     *
     * ## Example
     *
     * ```ts
     * const scenario = scenariosView.scenarioCalled('Payment should reject an expired card');
     *
     * await actor.attemptsTo(
     *   Ensure.that(scenario.outcome(), equals('FAILURE')),
     *   Ensure.that(scenario.sourceLocation(), includes('checkout.spec.ts')),
     *   scenario.viewDetails(),
     * );
     * ```
     *
     * @param name
     *  Substring to match against scenario names
     */
    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ScenariosView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    /**
     * The display names of all currently visible scenarios.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(scenariosView.scenarioNames(), contain('Payment should reject an expired card')),
     * );
     * ```
     */
    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('scenario names');

    /**
     * Searches for scenarios by entering text into the search input.
     *
     * On mobile viewports (when `{ mobile: true }` is set), this opens the bottom sheet,
     * enters the search term, and closes the sheet. On desktop, it types directly
     * into the always-visible search input.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.find('expired card'),
     *   Ensure.that(scenariosView.scenarioCount(), equals(1)),
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
                this.mobileSearchInput.enter(searchTerm),
                this.closeFilterSheet(),
            )
            : Task.where(the`#actor searches for ${searchTerm}`,
                this.searchInput.enter(searchTerm),
            );

    /**
     * Activates a filter chip by label (e.g. `'Failed'`, `'Passed'`, `'Pending'`).
     *
     * On mobile viewports, opens the bottom sheet to access filters.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.selectFilter('Failed'),
     *   Ensure.that(scenariosView.scenarioCount(), equals(7)),
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
     * The displayed result count text (e.g. `'7 of 23 scenarios'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenariosView.resultCountText(), includes('7 of 23'))
     * ```
     */
    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    /**
     * The current value of the search input field.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.find('checkout'),
     *   Ensure.that(scenariosView.searchInputValue(), equals('checkout')),
     * );
     * ```
     */
    searchInputValue = (): QuestionAdapter<string> =>
        Value.of(PageElement.located(By.css('[data-testid="search-input"] input'))
            .of(this.rootElement))
            .describedAs('search input value');

    /**
     * Labels of the currently active (pressed) filter chips.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.selectFilter('Failed'),
     *   Ensure.that(scenariosView.activeFilters(), equals(['Failed'])),
     * );
     * ```
     */
    activeFilters = (): Question<Promise<string[]>> =>
        PageElements.located(By.css('.filter-chip[aria-pressed="true"]'))
            .of(this.rootElement)
            .eachMappedTo(Text)
            .describedAs('active filter labels');

    private readonly runSelectorElement = this.child(By.css('select[aria-label^="Select test run"]'))
        .describedAs('run selector');

    /**
     * Whether the run selector dropdown is present (visible when multiple runs exist).
     */
    runSelectorIsPresent = (): Answerable<boolean> =>
        this.runSelectorElement.isPresent();

    /**
     * The displayed text of the run selector dropdown.
     */
    runSelectorText = (): QuestionAdapter<string> =>
        this.runSelectorElement.text().trim()
            .describedAs('run selector text');

    // URL helpers — type-safe navigation URLs using the same link() function as components

    /**
     * Builds URL for searching scenarios.
     *
     * @param searchTerm
     *  Search query (e.g., `'@module:playwright-web'`, `'@browser:chromium'`, `'authentication'`)
     *
     * @param runId
     *  Optional test run ID
     * @returns URL path with hash and query parameters
     *
     * ## Example
     *
     * ```ts
     * view.searchUrl('@module:playwright-web')
     * // → '#/tests?search=%40module%3Aplaywright-web'
     *
     * view.searchUrl('@module:playwright-web', '42')
     * // → '#/tests?run=42&search=%40module%3Aplaywright-web'
     * ```
     */
    searchUrl = (searchTerm: string, runId?: string): string =>
        '#' + link({ view: 'tests', run: runId, search: searchTerm });

    /**
     * Builds URL for filtering scenarios by outcome.
     *
     * @param filter
     *  Outcome filter type
     *
     * @param runId
     *  Optional test run ID
     *
     * @returns URL path with hash and query parameters
     *
     * ## Example
     *
     * ```ts
     * view.filterUrl('failed')
     * // → '#/tests?filter=failed'
     *
     * view.filterUrl('passed', '42')
     * // → '#/tests?run=42&filter=passed'
     * ```
     */
    filterUrl = (filter: OutcomeFilter, runId?: string): string =>
        '#' + link({ view: 'tests', run: runId, filter });

    /**
     * Builds URL for viewing scenario detail.
     *
     * @param scenario
     *  Scenario source location
     *
     * @param runId
     *  Optional test run ID
     *
     * @returns URL path with hash and query parameters
     *
     * ## Example
     *
     * ```ts
     * view.scenarioDetailUrl({ path: 'auth.spec.ts', line: 42 })
     * // → '#/tests/auth.spec.ts%3A42'
     *
     * view.scenarioDetailUrl({ path: 'auth.spec.ts', line: 42 }, '8333')
     * // → '#/tests/auth.spec.ts%3A42?run=8333'
     * ```
     */
    scenarioDetailUrl = (scenario: { path: string; line?: number }, runId?: string): string => {
        const path = scenario.line !== undefined
            ? scenario.path + ':' + scenario.line
            : scenario.path;
        return '#' + link({ view: 'tests', path, run: runId });
    };

    /**
     * Navigates to the Test Scenarios view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.open(),
     *   Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Scenarios view',
            this.navigation.openView('Test Scenarios'),
        );
}
