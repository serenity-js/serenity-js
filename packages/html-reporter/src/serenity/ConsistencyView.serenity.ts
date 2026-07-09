import type { Answerable, Question } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement, PageElements } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { HistoryDots } from './HistoryDots.serenity.js';
import { Navigation } from './Navigation.serenity.js';
import { OutcomeBadge } from './OutcomeBadge.serenity.js';
import { ResultCount } from './ResultCount.serenity.js';
import { SearchInput } from './SearchInput.serenity.js';

export class ConsistencyView<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;
    readonly historyDots: HistoryDots<NET>;

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        const child = (selector: string) => PageElement.located(By.css(selector)).of(this.rootElement);

        this.searchInput = new SearchInput(child('[data-testid="search-input"]') as unknown as Answerable<PageElement<NET>>);
        this.filterBar = new FilterBar(child('[data-testid="filter-bar"]') as unknown as Answerable<PageElement<NET>>);
        this.resultCount = new ResultCount(child('[data-testid="result-count"]') as unknown as Answerable<PageElement<NET>>);
        this.historyDots = new HistoryDots(child('[data-testid="history-dots"]') as unknown as Answerable<PageElement<NET>>);
    }

    private scenarioItems = () =>
        PageElements.located(By.css('.scenario-item'))
            .of(this.rootElement)
            .describedAs('consistency scenario items');

    outcomeBadgeFor = (scenarioItem: Answerable<PageElement<NET>>): OutcomeBadge<NET> =>
        new OutcomeBadge(PageElement.located(By.css('[data-testid="outcome-badge"]')).of(scenarioItem) as unknown as Answerable<PageElement<NET>>);

    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems().count().describedAs('number of consistency scenarios');

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    open = (): Task =>
        Task.where('#actor opens the Consistency view',
            this.navigation.openView('Consistency'),
        );
}
