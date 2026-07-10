import { includes } from '@serenity-js/assertions';
import type { Answerable, Question } from '@serenity-js/core';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { HistoryDots } from '../common/HistoryDots.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { OutcomeBadge } from '../common/OutcomeBadge.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

export class ConsistencyView<NET> extends InteractionObject<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;
    readonly historyDots: HistoryDots<NET>;

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')));
        this.historyDots = new HistoryDots(this.child(By.css('[data-testid="history-dots"]')));
    }

    private scenarioItems = () =>
        this.children(By.css('.scenario-item'))
            .describedAs('consistency scenario items');

    outcomeBadgeFor = (scenarioItem: Answerable<PageElement<NET>>): OutcomeBadge<NET> =>
        new OutcomeBadge<NET>(PageElement.located<NET>(By.css('[data-testid="outcome-badge"]')).of(scenarioItem));

    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems().count().describedAs('number of consistency scenarios');

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.children(By.css('.scenario-item'))
            .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
            .first()
            .describedAs(`consistency scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    scenarioNames = (): Question<Promise<string[]>> =>
        this.children(By.css('.scenario-name'))
            .eachMappedTo(Text)
            .describedAs('consistency scenario names');

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    open = (): Task =>
        Task.where('#actor opens the Consistency view',
            this.navigation.openView('Consistency'),
        );
}
