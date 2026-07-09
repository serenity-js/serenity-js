import { Answerable, Task, the } from '@serenity-js/core';
import { HistoryDots, OutcomeBadge, ResultCount, SearchInput } from '@serenity-js/html-reporter/serenity';
import { By, PageElement } from '@serenity-js/web';

import { Navigation, View } from '../app';

export class ConsistencyView<NET> extends View<NET> {

    private readonly searchInput: SearchInput<NET>;
    readonly historyDots: HistoryDots<NET>;
    readonly resultCount: ResultCount<NET>;

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.historyDots = new HistoryDots(this.child(By.css('[data-testid="history-dots"]')));
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')));
    }

    outcomeBadgeFor = (scenarioItem: Answerable<PageElement<NET>>) => {
        const badgeRoot = PageElement
            .located(By.css('[data-testid="outcome-badge"]'))
            .of(scenarioItem);
        return new OutcomeBadge(badgeRoot);
    }

    open = () =>
        Task.where(`#actor opens the Consistency view`,
            this.navigation.openView('Consistency'),
        )

    find = (searchTerm: Answerable<string>) =>
        Task.where(the`#actor searches for: ${ searchTerm }`,
            this.searchInput.enter(searchTerm),
        )
}
