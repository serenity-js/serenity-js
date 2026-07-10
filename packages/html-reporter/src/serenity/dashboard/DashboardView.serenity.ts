import { includes } from '@serenity-js/assertions';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { DashboardKpiCard } from './DashboardKpiCard.serenity.js';

export class DashboardView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    kpiCardAt = (index: number): DashboardKpiCard<NET> =>
        new DashboardKpiCard(this.children(By.css('[data-testid="dashboard-kpi-card"]')).nth(index));

    kpiCardCalled = (label: string): DashboardKpiCard<NET> => {
        const cardElement = this.children(By.css('[data-testid="dashboard-kpi-card"]'))
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new DashboardKpiCard(cardElement);
    };

    open = (): Task =>
        Task.where('#actor opens the Dashboard',
            this.navigation.openView('Dashboard'),
        );
}
