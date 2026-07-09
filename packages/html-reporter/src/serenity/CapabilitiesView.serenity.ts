import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { Navigation } from './Navigation.serenity.js';
import { ResultCount } from './ResultCount.serenity.js';
import { SearchInput } from './SearchInput.serenity.js';
import { View } from './View.serenity.js';

export class CapabilitiesView<NET> extends View<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')) as unknown as Answerable<PageElement<NET>>);
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')) as unknown as Answerable<PageElement<NET>>);
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')) as unknown as Answerable<PageElement<NET>>);
    }

    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );
}
