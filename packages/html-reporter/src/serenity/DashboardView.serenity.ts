import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { DashboardKpiCard } from './DashboardKpiCard.serenity.js';
import { View } from './View.serenity.js';

export class DashboardView<NET> extends View<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>) {
        super(rootElement);
    }

    kpiCardAt = (index: number): DashboardKpiCard<NET> =>
        new DashboardKpiCard(this.children(By.css('[data-testid="dashboard-kpi-card"]')).nth(index));
}
