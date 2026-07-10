import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { DashboardKpiCard } from './DashboardKpiCard.serenity.js';

export class DashboardView<NET> extends InteractionObject<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    kpiCardAt = (index: number): DashboardKpiCard<NET> =>
        new DashboardKpiCard(this.children(By.css('[data-testid="dashboard-kpi-card"]')).nth(index));

    open = (): Task =>
        Task.where('#actor opens the Dashboard',
            this.navigation.openView('Dashboard'),
        );
}
