import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, PageElement, PageElements, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ConsistencyItem } from './ConsistencyItem.serenity.js';
import { DashboardKpiCard } from './DashboardKpiCard.serenity.js';

export class DashboardView<NET> extends InteractionObject<NET> {

    private static readonly statusItemNameSelector = By.css('.status-item-name');

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="dashboard-kpi-card"]')).describedAs('dashboard KPI cards');
    private readonly consistencyItems = this.children(By.css('[data-testid="dashboard-consistency-card"] .status-item')).describedAs('dashboard consistency items');
    private readonly statusItemNames = this.children(By.css('[data-testid="dashboard-consistency-card"] .status-item-name')).describedAs('dashboard consistency item names');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    kpiCardAt = (index: number): DashboardKpiCard<NET> =>
        new DashboardKpiCard(this.kpiCards.nth(index));

    kpiCardCalled = (label: string): DashboardKpiCard<NET> => {
        const cardElement = this.kpiCards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new DashboardKpiCard(cardElement);
    };

    consistencyCardScenarioNames = (): Question<Promise<string[]>> =>
        this.statusItemNames
            .eachMappedTo(Text)
            .describedAs('dashboard consistency card scenario names');

    consistencyItemHistoryOutcomes = (scenarioName: string): Question<Promise<string[]>> => {
        const item = this.consistencyItems
            .where(Text.of(PageElement.located(DashboardView.statusItemNameSelector)), includes(scenarioName))
            .first()
            .describedAs(`consistency item "${scenarioName}"`);
        const dots = PageElements.located(By.css('[data-testid="history-dots"] .history-dot')).of(item);
        return dots.eachMappedTo(Attribute.called('data-outcome'))
            .describedAs(`history dot outcomes for "${scenarioName}"`);
    };

    consistencyItemCalled = (scenarioName: string): ConsistencyItem<NET> => {
        const item = this.consistencyItems
            .where(Text.of(PageElement.located(DashboardView.statusItemNameSelector)), includes(scenarioName))
            .first()
            .describedAs(`consistency item "${scenarioName}"`);
        return new ConsistencyItem(item);
    };

    slowestTestNames = (): Question<Promise<string[]>> =>
        this.children(By.css('[data-testid="dashboard-slowest-card"] .status-item-name'))
            .eachMappedTo(Text)
            .describedAs('dashboard slowest test names');

    hasTrendChart = (): Question<Promise<boolean>> =>
        this.child(By.css('.dashboard-trend-card canvas'))
            .isPresent()
            .describedAs('whether the dashboard has a trend chart');

    hasDetailsPanel = (): Question<Promise<boolean>> =>
        PageElement.located(By.css('[data-testid="run-details-panel"]'))
            .isPresent()
            .describedAs('whether the chart details panel is visible');

    // Behaviour — tasks

    open = (): Task =>
        Task.where('#actor opens the Dashboard',
            this.navigation.openView('Dashboard'),
        );
}
