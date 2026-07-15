import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task,the } from '@serenity-js/core';
import { By, Click, PageElement, Text } from '@serenity-js/web';

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

    kpiCardCalled = (label: string): KpiCard<NET> => {
        const cardElement = this.children(By.css('[data-testid="kpi-card"]'))
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new KpiCard(cardElement);
    };

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.children(By.css('.scenario-item'))
            .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
            .first()
            .describedAs(`errors scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    errorGroupTextFor = (name: string): QuestionAdapter<string> =>
        this.children(By.css('.scenario-item'))
            .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
            .first()
            .text()
            .describedAs(`error group text for "${name}"`);

    scenarioNames = (): Question<Promise<string[]>> =>
        this.children(By.css('.scenario-name'))
            .eachMappedTo(Text)
            .describedAs('errors scenario names');

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('errors view body text');

    errorGroupCount = (): QuestionAdapter<number> =>
        this.children(By.css('.scenario-item')).count()
            .describedAs('error group count');

    clickFirstErrorGroup = (): Task =>
        Task.where('#actor clicks the first error group',
            Click.on(
                this.children(By.css('.scenario-item')).first()
                    .describedAs('first error group'),
            ),
        );

    clickErrorGroupContaining = (text: Answerable<string>): Task =>
        Task.where(the`#actor clicks the error group containing ${ text }`,
            Click.on(
                this.children(By.css('.scenario-item'))
                    .where(Text, includes(text))
                    .first()
                    .describedAs(the`error group containing "${ text }"`),
            ),
        );

    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
