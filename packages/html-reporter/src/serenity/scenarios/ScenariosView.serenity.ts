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

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')));
    }

    private scenarioItems = () =>
        this.children(By.css('.scenario-item'))
            .describedAs('scenario items');

    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems().count().describedAs('number of scenarios');

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.children(By.css('.scenario-item'))
            .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
            .first()
            .describedAs(`scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    scenarioNames = (): Question<Promise<string[]>> =>
        this.children(By.css('.scenario-name'))
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

    private runSelector = () =>
        this.child(By.css('select[aria-label="Select test run"]'))
            .describedAs('run selector');

    runSelectorIsPresent = (): Answerable<boolean> =>
        this.runSelector().isPresent();

    open = (): Task =>
        Task.where('#actor opens the Scenarios view',
            this.navigation.openView('Test Scenarios'),
        );
}
