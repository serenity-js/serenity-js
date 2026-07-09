import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { FilterBar, KpiCard } from '@serenity-js/html-reporter/serenity';
import { By, PageElement } from '@serenity-js/web';

import { Navigation, View } from '../app';

export class TimelineView<NET> extends View<NET> {

    readonly filterBar: FilterBar<NET>;

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);

        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
    }

    kpiCardAt = (index: number) =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index))

    open = () =>
        Task.where(`#actor opens the Timeline view`,
            this.navigation.openView('Timeline'),
        )
}
