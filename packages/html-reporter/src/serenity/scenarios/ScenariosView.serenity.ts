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

export class ScenariosView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));
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

    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems.count().describedAs('number of scenarios');

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ScenariosView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('scenario names');

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

    selectFilter = (label: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor selects the ${label} filter`,
                this.openFilterSheet(),
                this.mobileFilterBar.selectFilter(label),
                this.closeFilterSheet(),
            )
            : this.filterBar.selectFilter(label);

    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    searchInputValue = (): QuestionAdapter<string> =>
        Value.of(PageElement.located(By.css('[data-testid="search-input"] input'))
            .of(this.rootElement))
            .describedAs('search input value');

    activeFilters = (): Question<Promise<string[]>> =>
        PageElements.located(By.css('.filter-chip[aria-pressed="true"]'))
            .of(this.rootElement)
            .eachMappedTo(Text)
            .describedAs('active filter labels');

    private readonly runSelectorElement = this.child(By.css('select[aria-label^="Select test run"]'))
        .describedAs('run selector');

    runSelectorIsPresent = (): Answerable<boolean> =>
        this.runSelectorElement.isPresent();

    runSelectorText = (): QuestionAdapter<string> =>
        this.runSelectorElement.text().trim()
            .describedAs('run selector text');

    // URL helpers — type-safe navigation URLs using the same link() function as components

    /**
     * Builds URL for searching scenarios.
     * 
     * @param searchTerm - Search query (e.g., '@module:playwright-web', '@browser:chromium', 'authentication')
     * @param runId - Optional test run ID
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
     * @param filter - Outcome filter type
     * @param runId - Optional test run ID
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
     * @param scenario - Scenario source location
     * @param runId - Optional test run ID
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

    open = (): Task =>
        Task.where('#actor opens the Scenarios view',
            this.navigation.openView('Test Scenarios'),
        );
}
