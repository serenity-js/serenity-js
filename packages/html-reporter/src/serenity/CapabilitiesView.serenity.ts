import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { InteractionObject } from './InteractionObject.serenity.js';
import { Navigation } from './Navigation.serenity.js';
import { ResultCount } from './ResultCount.serenity.js';
import { SearchInput } from './SearchInput.serenity.js';

export class CapabilitiesView<NET> extends InteractionObject<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')));
    }

    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );
}
