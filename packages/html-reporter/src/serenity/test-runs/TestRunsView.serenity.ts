import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Interaction, Task } from '@serenity-js/core';
import { Attribute, By, Click, Key, PageElement, Press, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class TestRunsView<NET> extends InteractionObject<NET> {

    // Structure — page elements
    private readonly chartCanvas = this.child(By.css('canvas')).describedAs('trend chart canvas');
    private readonly appContainer = PageElement.located(By.css('#app')).describedAs('test runs view container');
    private readonly runRows = this.children(By.css('.scenario-list .scenario-item')).describedAs('test run rows');
    private readonly commitLink = this.child(By.css('a[href*="/commit/"]')).describedAs('commit link');
    private readonly detailsPanel = PageElement.located(By.css('[data-testid="run-details-panel"]')).describedAs('run details panel');
    private readonly detailsCta = PageElement.located(By.css('[data-testid="run-details-cta"]')).describedAs('run details CTA button');
    private readonly detailsTitle = PageElement.located(By.css('.run-details-title')).describedAs('run details title');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.appContainer).describedAs('test runs view body text');

    runCount = (): Question<Promise<number>> =>
        this.runRows.count().describedAs('number of test run rows');

    hasTrendChart = (): Question<Promise<boolean>> =>
        this.chartCanvas
            .isPresent()
            .describedAs('whether the test runs view has a trend chart');

    hasDetailsPanel = (): Question<Promise<boolean>> =>
        this.detailsPanel
            .isPresent()
            .describedAs('whether the run details panel is visible');

    detailsPanelTitle = (): QuestionAdapter<string> =>
        Text.of(this.detailsTitle).trim()
            .describedAs('run details panel title');

    detailsPanelText = (): QuestionAdapter<string> =>
        Text.of(this.detailsPanel).trim()
            .describedAs('run details panel text');

    detailsCtaText = (): QuestionAdapter<string> =>
        Text.of(this.detailsCta).trim()
            .describedAs('run details CTA text');

    commitLinkText = (): QuestionAdapter<string> =>
        Text.of(this.commitLink).trim()
            .describedAs('commit link text');

    commitLinkHref = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.commitLink)
            .describedAs('commit link href');

    // Behaviour — tasks

    clickChart = (): Task =>
        Task.where('#actor clicks the trend chart',
            Interaction.where('#actor clicks the last bar in the chart', async actor => {
                const element = await actor.answer(this.chartCanvas);
                const nativeLocator = await element.nativeElement() as any;
                const box = await nativeLocator.boundingBox();
                const count = await actor.answer(this.runRows.count());
                if (box && count > 0) {
                    const barIndex = count - 1;
                    const plotLeft = box.width * 0.10;
                    const plotWidth = box.width * 0.80;
                    const x = plotLeft + plotWidth * (barIndex + 0.5) / count;
                    await nativeLocator.click({ position: { x, y: box.height * 0.5 } });
                }
            }),
        );

    clickChartBar = (barIndex: number): Task =>
        Task.where(`#actor clicks bar ${barIndex} in the trend chart`,
            Interaction.where('#actor clicks the chart canvas', async actor => {
                const element = await actor.answer(this.chartCanvas);
                const nativeLocator = await element.nativeElement() as any;
                const box = await nativeLocator.boundingBox();
                const count = await actor.answer(this.runRows.count());
                if (box && count > 0) {
                    const plotLeft = box.width * 0.10;
                    const plotWidth = box.width * 0.80;
                    const x = plotLeft + plotWidth * (barIndex + 0.5) / count;
                    await nativeLocator.click({ position: { x, y: box.height * 0.5 } });
                }
            }),
        );

    selectRun = (index: number): Task =>
        Task.where(`#actor selects test run ${index + 1}`,
            Click.on(this.runRows
                .nth(index)
                .describedAs(`test run entry ${index + 1}`)
            ),
        );

    clickDetailsCtaButton = (): Task =>
        Task.where('#actor clicks the run details CTA button',
            Click.on(this.detailsCta),
        );

    dismissDetailsPanel = (): Task =>
        Task.where('#actor dismisses the run details panel',
            Press.the(Key.Escape),
        );

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
