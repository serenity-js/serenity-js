import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class TestRunsView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private appContainer = () =>
        PageElement.located(By.css('#app'))
            .describedAs('test runs view container');

    private runRows = () =>
        this.children(By.css('.scenario-list .scenario-item'))
            .describedAs('test run rows');

    private branchLink = () =>
        this.child(By.css('a[href*="/tree/"]'))
            .describedAs('branch link');

    private commitLink = () =>
        this.child(By.css('a[href*="/commit/"]'))
            .describedAs('commit link');

    private detailsPanel = () =>
        PageElement.located(By.css('[data-testid="run-details-panel"]'))
            .describedAs('run details panel');

    private detailsCta = () =>
        PageElement.located(By.css('[data-testid="run-details-cta"]'))
            .describedAs('run details CTA button');

    private detailsTitle = () =>
        PageElement.located(By.css('.run-details-title'))
            .describedAs('run details title');

    private detailsMetricValues = () =>
        PageElement.located(By.css('.run-details-metrics'))
            .describedAs('run details metrics');

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.appContainer()).describedAs('test runs view body text');

    runCount = (): Question<Promise<number>> =>
        this.runRows().count().describedAs('number of test run rows');

    hasTrendChart = (): Question<Promise<boolean>> =>
        this.child(By.css('canvas'))
            .isPresent()
            .describedAs('whether the test runs view has a trend chart');

    hasDetailsPanel = (): Question<Promise<boolean>> =>
        this.detailsPanel()
            .isPresent()
            .describedAs('whether the run details panel is visible');

    detailsPanelTitle = (): QuestionAdapter<string> =>
        Text.of(this.detailsTitle()).trim()
            .describedAs('run details panel title');

    detailsPanelText = (): QuestionAdapter<string> =>
        Text.of(this.detailsPanel()).trim()
            .describedAs('run details panel text');

    detailsCtaText = (): QuestionAdapter<string> =>
        Text.of(this.detailsCta()).trim()
            .describedAs('run details CTA text');

    branchLinkText = (): QuestionAdapter<string> =>
        Text.of(this.branchLink()).trim()
            .describedAs('branch link text');

    branchLinkHref = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.branchLink())
            .describedAs('branch link href');

    commitLinkText = (): QuestionAdapter<string> =>
        Text.of(this.commitLink()).trim()
            .describedAs('commit link text');

    commitLinkHref = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.commitLink())
            .describedAs('commit link href');

    selectRun = (index: number): Task =>
        Task.where(`#actor selects test run ${index + 1}`,
            Click.on(this.runRows()
                .nth(index)
                .describedAs(`test run entry ${index + 1}`)
            ),
        );

    clickDetailsCtaButton = (): Task =>
        Task.where('#actor clicks the run details CTA button',
            Click.on(this.detailsCta()),
        );

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
