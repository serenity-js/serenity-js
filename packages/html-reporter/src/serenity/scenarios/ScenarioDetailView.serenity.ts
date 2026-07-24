import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ErrorBlock } from '../errors/ErrorBlock.serenity.js';
import { ActivityItem } from './ActivityItem.serenity.js';

export class ScenarioDetailView<NET> extends InteractionObject<NET> {

    // Structure — page elements
    private readonly errorBlockElement = this.child(By.css('[data-testid="error-block"]')).describedAs('error block');
    private readonly copyButton = this.child(By.css('.copy-btn')).describedAs('copy source location button');
    private readonly retryTabs = this.children(By.css('.retry-tab')).describedAs('retry tabs');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    scenarioName = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-detail-title')).text().trim()
            .describedAs('scenario name');

    sourcePath = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-source')).text().trim()
            .describedAs('scenario source path');

    errorBlock = (): ErrorBlock<NET> =>
        new ErrorBlock(this.errorBlockElement);

    hasError = (): Question<Promise<boolean>> =>
        this.errorBlockElement.isPresent()
            .describedAs('whether scenario detail shows an error block');

    hasCopySourceButton = (): Question<Promise<boolean>> =>
        this.copyButton.isPresent()
            .describedAs('whether copy source location button is present');

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

    photoStripCount = (): QuestionAdapter<number> =>
        this.children(By.css('.photo-strip-item')).count()
            .describedAs('photo strip count');

    retryTabCount = (): Question<Promise<number>> =>
        this.retryTabs.count()
            .describedAs('retry tab count');

    activeAttemptLabel = (): QuestionAdapter<string> =>
        this.children(By.css('.retry-tab.active')).first().text().trim()
            .describedAs('active attempt tab label');

    videoSource = (): QuestionAdapter<string> =>
        Attribute.called('src').of(this.child(By.css('video source')))
            .describedAs('video source URL');

    hasVideo = (): Question<Promise<boolean>> =>
        this.child(By.css('video')).isPresent()
            .describedAs('whether video is present');

    metaText = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-detail-meta')).text().trim()
            .describedAs('scenario detail meta text');

    activityTreeText = (): QuestionAdapter<string> =>
        this.child(By.css('.activity-tree')).text().trim()
            .describedAs('activity tree text');

    firstRetryTabLabel = (): QuestionAdapter<string> =>
        this.retryTabs.first().text().trim()
            .describedAs('first retry tab label');

    lastRetryTabLabel = (): QuestionAdapter<string> =>
        this.retryTabs.last().text().trim()
            .describedAs('last retry tab label');

    // Behaviour — tasks

    copySourceLocation = (): Task =>
        Task.where('#actor copies the source location',
            Click.on(this.copyButton),
        );

    openPhotoAt = (index: number): Task =>
        Task.where(`#actor opens photo at index ${ index }`,
            Click.on(
                this.children(By.css('.photo-strip-item img'))
                    .nth(index)
                    .describedAs(`photo thumbnail #${ index }`)
            ),
        );

    switchToAttempt = (attemptNumber: number): Task =>
        Task.where(`#actor switches to attempt ${ attemptNumber }`,
            Click.on(
                this.retryTabs
                    .where(Text, includes(`Attempt ${ attemptNumber }`))
                    .first()
                    .describedAs(`retry tab for attempt ${ attemptNumber }`)
            ),
        );

    open = (): Task =>
        Task.where('#actor opens the Scenario Detail view',
            this.navigation.openView('Test Scenarios'),
        );
}
