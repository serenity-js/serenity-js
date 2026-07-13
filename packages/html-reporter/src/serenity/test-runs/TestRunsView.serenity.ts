import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class TestRunsView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private runRows = () =>
        this.children(By.css('.scenario-list .scenario-item'))
            .describedAs('test run rows');

    runCount = (): Question<Promise<number>> =>
        this.runRows().count().describedAs('number of test run rows');

    hasTrendChart = (): Question<Promise<boolean>> =>
        this.child(By.css('canvas'))
            .isPresent()
            .describedAs('whether the test runs view has a trend chart');

    selectRun = (index: number): Task =>
        Task.where(`#actor selects test run ${index + 1}`,
            Click.on(this.runRows()
                .nth(index)
                .describedAs(`test run entry ${index + 1}`)
            ),
        );

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
