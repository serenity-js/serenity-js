import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement, PageElements, Text, Value } from '@serenity-js/web';

import type { OutcomeFilter } from '../../utils/link.js';
import { link } from '../../utils/link.js';
import { FilterBar } from '../common/FilterBar.serenity.js';
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

    // Structure — page elements
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('scenario items');
    private readonly scenarioNameElements = this.children(ScenariosView.scenarioNameSelector).describedAs('scenario names');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

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
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    selectFilter = (label: Answerable<string>): Task =>
        this.filterBar.selectFilter(label);

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
     * @example
     * view.searchUrl('@module:playwright-web')
     * // → '#/tests?search=%40module%3Aplaywright-web'
     * 
     * @example
     * view.searchUrl('@module:playwright-web', '42')
     * // → '#/tests?run=42&search=%40module%3Aplaywright-web'
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
     * @example
     * view.filterUrl('failed')
     * // → '#/tests?filter=failed'
     * 
     * @example
     * view.filterUrl('passed', '42')
     * // → '#/tests?run=42&filter=passed'
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
     * @example
     * view.scenarioDetailUrl({ path: 'auth.spec.ts', line: 42 })
     * // → '#/tests/auth.spec.ts%3A42'
     * 
     * @example
     * view.scenarioDetailUrl({ path: 'auth.spec.ts', line: 42 }, '8333')
     * // → '#/tests/auth.spec.ts%3A42?run=8333'
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
