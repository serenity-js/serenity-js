import type { Answerable } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { ErrorBlock } from './ErrorBlock.serenity.js';
import { InteractionObject } from './InteractionObject.serenity.js';
import { Navigation } from './Navigation.serenity.js';

export class ScenarioDetailView<NET> extends InteractionObject<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    scenarioName = (): Question<Promise<string>> =>
        Question.about('scenario name', async actor => {
            const element = await actor.answer(this.child(By.css('.scenario-detail-title')));
            return (await element.text()).trim();
        });

    errorBlock = (): ErrorBlock<NET> =>
        new ErrorBlock(this.child(By.css('[data-testid="error-block"]')));

    hasError = (): Question<Promise<boolean>> =>
        this.child(By.css('[data-testid="error-block"]')).isPresent()
            .describedAs('whether scenario detail shows an error block');

    breadcrumbText = (): Question<Promise<string>> =>
        Question.about('breadcrumb text', async actor => {
            const element = await actor.answer(this.child(By.css('.breadcrumb')));
            return (await element.text()).trim();
        });

    open = (): Task =>
        Task.where('#actor opens the Scenario Detail view',
            this.navigation.openView('Test Scenarios'),
        );
}
