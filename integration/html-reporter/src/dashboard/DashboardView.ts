import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { DashboardKpiCard } from '@serenity-js/html-reporter/serenity';
import { By, PageElement } from '@serenity-js/web';

import { Navigation, View } from '../app';

export class DashboardView<NET> extends View<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    kpiCardAt = (index: number) =>
        new DashboardKpiCard(this.children(By.css('[data-testid="dashboard-kpi-card"]')).nth(index))

    open = () =>
        Task.where(`#actor opens the Dashboard`,
            this.navigation.openView('Dashboard'),
        )
}
