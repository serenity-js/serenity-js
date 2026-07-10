import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ErrorBlock } from '../errors/ErrorBlock.serenity.js';
import { ActivityItem } from './ActivityItem.serenity.js';

export class ScenarioDetailView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    scenarioName = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-detail-title')).text().trim()
            .describedAs('scenario name');

    errorBlock = (): ErrorBlock<NET> =>
        new ErrorBlock(this.child(By.css('[data-testid="error-block"]')));

    hasError = (): Question<Promise<boolean>> =>
        this.child(By.css('[data-testid="error-block"]')).isPresent()
            .describedAs('whether scenario detail shows an error block');

    breadcrumbText = (): QuestionAdapter<string> =>
        this.child(By.css('.breadcrumb')).text().trim()
            .describedAs('breadcrumb text');

    activityCalled = (name: string): ActivityItem<NET> => {
        const matchingRow = this.children(By.css('.activity-row'))
            .where(Text.of(PageElement.located(By.css('.activity-name'))), includes(name))
            .first()
            .describedAs(`activity called "${name}"`);
        return new ActivityItem(matchingRow);
    };

    executionHistoryDotCount = (): Question<Promise<number>> =>
        this.children(By.css('.exec-history-dot'))
            .count()
            .describedAs('execution history dot count');

    open = (): Task =>
        Task.where('#actor opens the Scenario Detail view',
            this.navigation.openView('Test Scenarios'),
        );
}
