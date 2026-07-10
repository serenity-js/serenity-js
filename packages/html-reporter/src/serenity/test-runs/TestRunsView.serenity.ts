import type { Answerable, Question } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElements } from '@serenity-js/web';

import { Navigation } from '../common/Navigation.serenity.js';

export class TestRunsView<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    private runRows = () =>
        PageElements.located(By.css('.scenario-list .scenario-item'))
            .of(this.rootElement)
            .describedAs('test run rows');

    runCount = (): Question<Promise<number>> =>
        this.runRows().count().describedAs('number of test run rows');

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
