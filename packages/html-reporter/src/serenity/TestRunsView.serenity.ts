import type { Answerable } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElements } from '@serenity-js/web';

import { Navigation } from './Navigation.serenity.js';

export class TestRunsView<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    private runRows = () =>
        PageElements.located(By.css('.scenario-list .scenario-item'))
            .of(this.rootElement)
            .describedAs('test run rows');

    runCount = (): Question<Promise<number>> =>
        Question.about('number of test run rows', async actor => {
            const elements = await actor.answer(this.runRows());
            return elements.length;
        });

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
