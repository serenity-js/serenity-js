import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { KpiCard } from '../common/KpiCard.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class TimelineView<NET> extends InteractionObject<NET> {

    // Structure — child interaction objects
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="kpi-card"]')).describedAs('timeline KPI cards');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.kpiCards.nth(index));

    kpiCardCalled = (label: string): KpiCard<NET> => {
        const cardElement = this.kpiCards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new KpiCard(cardElement);
    };

    activeFilters = (): Question<Promise<string[]>> =>
        this.filterBar.activeFilters();

    scenarioCount = (): Question<Promise<number>> =>
        this.children(By.css('.timeline-row')).count()
            .describedAs('timeline scenario count');

    // Behaviour — tasks

    open = (): Task =>
        Task.where('#actor opens the Timeline view',
            this.navigation.openView('Timeline'),
        );
}
