import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { FilterBar } from './FilterBar.serenity.js';
import { KpiCard } from './KpiCard.serenity.js';
import { View } from './View.serenity.js';

export class TimelineView<NET> extends View<NET> {

    readonly filterBar: FilterBar<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>) {
        super(rootElement);

        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
    }

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index));
}
