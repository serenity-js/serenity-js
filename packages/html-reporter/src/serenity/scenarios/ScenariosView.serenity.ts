import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

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

    private readonly runSelectorElement = this.child(By.css('select[aria-label^="Select test run"]'))
        .describedAs('run selector');

    runSelectorIsPresent = (): Answerable<boolean> =>
        this.runSelectorElement.isPresent();

    runSelectorText = (): QuestionAdapter<string> =>
        this.runSelectorElement.text().trim()
            .describedAs('run selector text');

    open = (): Task =>
        Task.where('#actor opens the Scenarios view',
            this.navigation.openView('Test Scenarios'),
        );
}
