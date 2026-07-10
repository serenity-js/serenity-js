import type { Answerable, Question } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { HistoryDots } from './HistoryDots.serenity.js';
import { InteractionObject } from './InteractionObject.serenity.js';
import { Navigation } from './Navigation.serenity.js';
import { OutcomeBadge } from './OutcomeBadge.serenity.js';
import { ResultCount } from './ResultCount.serenity.js';
import { SearchInput } from './SearchInput.serenity.js';

export class ConsistencyView<NET> extends InteractionObject<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;
    readonly historyDots: HistoryDots<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
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
