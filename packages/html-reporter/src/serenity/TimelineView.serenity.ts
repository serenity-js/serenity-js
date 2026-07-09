import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { KpiCard } from './KpiCard.serenity.js';
import { Navigation } from './Navigation.serenity.js';
import { View } from './View.serenity.js';

export class TimelineView<NET> extends View<NET> {

    readonly filterBar: FilterBar<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')) as unknown as Answerable<PageElement<NET>>);
    }

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index));

    open = (): Task =>
        Task.where('#actor opens the Timeline view',
            this.navigation.openView('Timeline'),
        );
}
