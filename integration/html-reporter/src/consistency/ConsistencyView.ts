import { Answerable, Task, the } from '@serenity-js/core';
import { HistoryDots, OutcomeBadge, SearchInput } from '@serenity-js/html-reporter/serenity';
import { By, PageElement, PageElements } from '@serenity-js/web';

import { Navigation } from '../app';

export class ConsistencyView<NET> {

    private readonly searchInput: SearchInput<NET>;
    readonly historyDots: HistoryDots<NET>;

    constructor(
        private readonly rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        const searchInputRoot = PageElement
            .located(By.css('[data-testid="search-input"]'))
            .of(this.rootElement);

        this.searchInput = new SearchInput(searchInputRoot);

        const historyDotsRoot = PageElement
            .located(By.css('[data-testid="history-dots"]'))
            .of(this.rootElement);

        this.historyDots = new HistoryDots(historyDotsRoot);
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
