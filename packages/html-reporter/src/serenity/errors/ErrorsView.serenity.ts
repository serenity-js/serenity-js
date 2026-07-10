import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { KpiCard } from '../common/KpiCard.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

export class ErrorsView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index));

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.children(By.css('.scenario-item'))
            .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
            .first()
            .describedAs(`errors scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    scenarioNames = (): Question<Promise<string[]>> =>
        this.children(By.css('.scenario-name'))
            .eachMappedTo(Text)
            .describedAs('errors scenario names');

    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
