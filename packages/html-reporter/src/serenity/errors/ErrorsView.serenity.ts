import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task,the } from '@serenity-js/core';
import { By, Click, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { KpiCard } from '../common/KpiCard.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

export class ErrorsView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="kpi-card"]')).describedAs('errors KPI cards');
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('errors scenario items');
    private readonly scenarioNameElements = this.children(ErrorsView.scenarioNameSelector).describedAs('errors scenario names');

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

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`errors scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    errorGroupTextFor = (name: string): QuestionAdapter<string> =>
        this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .text()
            .describedAs(`error group text for "${name}"`);

    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('errors scenario names');

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('errors view body text');

    errorGroupCount = (): QuestionAdapter<number> =>
        this.scenarioItems.count()
            .describedAs('error group count');

    // Behaviour — tasks

    clickFirstErrorGroup = (): Task =>
        Task.where('#actor clicks the first error group',
            Click.on(
                this.scenarioItems.first()
                    .describedAs('first error group'),
            ),
        );

    clickErrorGroupContaining = (text: Answerable<string>): Task =>
        Task.where(the`#actor clicks the error group containing ${ text }`,
            Click.on(
                this.scenarioItems
                    .where(Text, includes(text))
                    .first()
                    .describedAs(the`error group containing ${ text }`),
            ),
        );

    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
