import { includes } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Interaction, Question, Task } from '@serenity-js/core';
import { Attribute, By, Click, Key, Page, PageElement, PageElements, Press, Text } from '@serenity-js/web';

import type { OutcomeFilter } from '../../utils/link.js';
import { link } from '../../utils/link.js';
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

    hasModuleTable = (): Question<Promise<boolean>> =>
        PageElement.located(By.css('.run-details-table'))
            .of(this.detailsPanel)
            .isPresent()
            .describedAs('whether the run details panel has a module table');

    moduleNames = (): Question<Promise<string[]>> =>
        PageElements.located(By.css('.run-details-table-module a'))
            .of(this.detailsPanel)
            .eachMappedTo(Text)
            .describedAs('module names in the table');

    /**
     * Returns the current run ID from the URL's hash parameters.
     * Returns undefined if no run parameter is found.
     */
    currentRunId = (): Question<Promise<string | undefined>> =>
        Question.about('current run ID', async actor => {
            const url = await actor.answer(Page.current().url().href);
            const match = url.match(/[?&]run=([^&]+)/);
            return match ? decodeURIComponent(match[1]) : undefined;
        });

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

    clickModuleName = (moduleName: string): Task =>
        Task.where(`#actor clicks module "${moduleName}" in the details panel`,
            Click.on(
                PageElements.located(By.css('.run-details-table-module a'))
                    .of(this.detailsPanel)
                    .where(Text, includes(moduleName))
                    .first()
                    .describedAs(`module link "${moduleName}"`)
            ),
        );

    clickModulePassedCount = (moduleName: string): Task =>
        Task.where(`#actor clicks the Passed count for module "${moduleName}"`,
            Interaction.where(`#actor finds and clicks the Passed count`, async actor => {
                // Find the row for this module
                const moduleRows = PageElements.located(By.css('.run-details-table-row'))
                    .of(this.detailsPanel);
                
                // Find the row containing this module name
                const targetRow = moduleRows
                    .where(Text, includes(moduleName))
                    .first();
                
                // Within that row, find the 4th td (Passed column, after Module/Outcome/Tests)
                const passedButton = PageElement.located(By.css('td:nth-child(4) .count-link'))
                    .of(targetRow)
                    .describedAs(`Passed count button for ${moduleName}`);
                
                const element = await actor.answer(passedButton);
                await element.click();
            }),
        );

    clickModuleFailedCount = (moduleName: string): Task =>
        Task.where(`#actor clicks the Failed count for module "${moduleName}"`,
            Interaction.where(`#actor finds and clicks the Failed count`, async actor => {
                const moduleRows = PageElements.located(By.css('.run-details-table-row'))
                    .of(this.detailsPanel);
                
                const targetRow = moduleRows
                    .where(Text, includes(moduleName))
                    .first();
                
                // 5th td (Failed column)
                const failedButton = PageElement.located(By.css('td:nth-child(5) .count-link'))
                    .of(targetRow)
                    .describedAs(`Failed count button for ${moduleName}`);
                
                const element = await actor.answer(failedButton);
                await element.click();
            }),
        );

    clickModuleSkippedCount = (moduleName: string): Task =>
        Task.where(`#actor clicks the Skipped count for module "${moduleName}"`,
            Interaction.where(`#actor finds and clicks the Skipped count`, async actor => {
                const moduleRows = PageElements.located(By.css('.run-details-table-row'))
                    .of(this.detailsPanel);
                
                const targetRow = moduleRows
                    .where(Text, includes(moduleName))
                    .first();
                
                // 6th td (Skipped column)
                const skippedButton = PageElement.located(By.css('td:nth-child(6) .count-link'))
                    .of(targetRow)
                    .describedAs(`Skipped count button for ${moduleName}`);
                
                const element = await actor.answer(skippedButton);
                await element.click();
            }),
        );

    // URL helpers — type-safe navigation URLs using the same link() function as components

    /**
     * Builds URL for viewing a module's scenarios with optional outcome filter.
     * 
     * Accepts Answerable parameters so Questions can be passed directly without actor.answer().
     * 
     * @param moduleName - Module identifier (e.g., 'playwright-web')
     * @param runId - Test run ID (can be a Question)
     * @param filter - Optional outcome filter ('passed', 'failed', 'skipped')
     * @returns URL path with hash and query parameters
     * 
     * @example
     * // With static values
     * view.moduleUrl('playwright-web', '42')
     * // → '#/tests?run=42&search=%40module%3Aplaywright-web'
     * 
     * @example
     * // With outcome filter
     * view.moduleUrl('playwright-web', '42', 'failed')
     * // → '#/tests?run=42&search=%40module%3Aplaywright-web&filter=failed'
     * 
     * @example
     * // With Question (idiomatic Screenplay)
     * view.moduleUrl('playwright-web', view.currentRunId(), 'passed')
     * // Actor resolves currentRunId() automatically
     */
    moduleUrl = (
        moduleName: Answerable<string>,
        runId: Answerable<string | undefined>,
        filter?: Answerable<OutcomeFilter>
    ): QuestionAdapter<string> =>
        Question.about(`URL for module ${moduleName}`, async actor => {
            const resolvedModuleName = await actor.answer(moduleName);
            const resolvedRunId = await actor.answer(runId);
            const resolvedFilter = filter ? await actor.answer(filter) : undefined;
            
            return '#' + link({
                view: 'tests',
                run: resolvedRunId,
                search: '@module:' + resolvedModuleName,
                ...(resolvedFilter ? { filter: resolvedFilter } : {}),
            });
        });

    open = (): Task =>
        Task.where('#actor opens the Test Runs view',
            this.navigation.openView('Test Runs'),
        );
}
