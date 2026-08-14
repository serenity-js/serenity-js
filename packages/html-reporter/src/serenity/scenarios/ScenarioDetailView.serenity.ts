import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ErrorBlock } from '../errors/ErrorBlock.serenity.js';
import { ActivityItem } from './ActivityItem.serenity.js';

/**
 * Interaction object representing the **Scenario Detail** view in the HTML report.
 *
 * Shows the full details of a single test scenario: its activity tree, error block,
 * screenshots (photo strip), execution history dots, retry attempt tabs, and video
 * evidence when available. Composes {@link ErrorBlock} and {@link ActivityItem}
 * interaction objects for specific sections.
 *
 * ## Instantiation
 *
 * ```ts
 * import { ScenarioDetailView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const scenarioDetailView = new ScenarioDetailView(
 *   PageElement.located(By.css('[data-testid="scenario-detail"]')).describedAs('scenario detail view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   scenariosView.scenarioCalled(failingTest).viewDetails(),
 *   Ensure.that(scenarioDetailView.scenarioName(), includes('Payment should reject')),
 *   Ensure.that(scenarioDetailView.hasError(), equals(true)),
 *   Ensure.that(scenarioDetailView.errorBlock().name(), equals('AssertionError')),
 *   Ensure.that(scenarioDetailView.activityCalled('clicks submit').outcome(), equals('FAILURE')),
 *   Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ScenarioDetailView<NET> extends InteractionObject<NET> {

    // Structure — page elements
    private readonly errorBlockElement = this.child(By.css('[data-testid="error-block"]')).describedAs('error block');
    private readonly copyButton = this.child(By.css('.copy-btn')).describedAs('copy source location button');
    private readonly retryTabs = this.children(By.css('.retry-tab')).describedAs('retry tabs');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    /**
     * The scenario's display name in the detail view header.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.scenarioName(), includes('Payment should reject'))
     * ```
     */
    scenarioName = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-detail-title')).text().trim()
            .describedAs('scenario name');

    /**
     * The scenario's source file path and line number (e.g. `'checkout.spec.ts:42'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.sourcePath(), includes('checkout.spec.ts'))
     * ```
     */
    sourcePath = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-source')).text().trim()
            .describedAs('scenario source path');

    /**
     * Returns an {@link ErrorBlock} interaction object for inspecting the error details.
     *
     * ## Example
     *
     * ```ts
     * const errorBlock = scenarioDetailView.errorBlock();
     *
     * await actor.attemptsTo(
     *   Ensure.that(errorBlock.name(), equals('TimeoutError')),
     *   Ensure.that(errorBlock.message(), includes('waiting for selector')),
     * );
     * ```
     */
    errorBlock = (): ErrorBlock<NET> =>
        new ErrorBlock(this.errorBlockElement);

    /**
     * Whether the error block element is present in the detail view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.hasError(), equals(true))
     * ```
     */
    hasError = (): Question<Promise<boolean>> =>
        this.errorBlockElement.isPresent()
            .describedAs('whether scenario detail shows an error block');

    /**
     * Whether the copy source location button is present.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.hasCopySourceButton(), equals(true))
     * ```
     */
    hasCopySourceButton = (): Question<Promise<boolean>> =>
        this.copyButton.isPresent()
            .describedAs('whether copy source location button is present');

    /**
     * The breadcrumb navigation text in the detail view header.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.breadcrumbText(), includes('Test Scenarios'))
     * ```
     */
    breadcrumbText = (): QuestionAdapter<string> =>
        this.child(By.css('.breadcrumb')).text().trim()
            .describedAs('breadcrumb text');

    /**
     * Locates an {@link ActivityItem} by name within the activity tree.
     *
     * Uses PEQL substring matching — the name doesn't need to be an exact match.
     *
     * ## Example
     *
     * ```ts
     * const activity = scenarioDetailView.activityCalled('clicks submit');
     *
     * await actor.attemptsTo(
     *   Ensure.that(activity.outcome(), equals('FAILURE')),
     * );
     * ```
     *
     * @param name
     *  Substring to match against activity names in the tree
     */
    activityCalled = (name: string): ActivityItem<NET> => {
        const matchingRow = this.children(By.css('.activity-row'))
            .where(Text.of(PageElement.located(By.css('.activity-name'))), includes(name))
            .first()
            .describedAs(`activity called "${name}"`);
        return new ActivityItem(matchingRow);
    };

    /**
     * The number of execution history dots displayed.
     *
     * Each dot represents one historical run of this scenario.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.executionHistoryDotCount(), isGreaterThan(0))
     * ```
     */
    executionHistoryDotCount = (): Question<Promise<number>> =>
        this.children(By.css('.exec-history-dot'))
            .count()
            .describedAs('execution history dot count');

    /**
     * The number of photo strip thumbnails displayed.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.photoStripCount(), equals(3))
     * ```
     */
    photoStripCount = (): QuestionAdapter<number> =>
        this.children(By.css('.photo-strip-item')).count()
            .describedAs('photo strip count');

    /**
     * The number of retry attempt tabs displayed.
     *
     * Only present when the scenario was retried.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.retryTabCount(), equals(2))
     * ```
     */
    retryTabCount = (): Question<Promise<number>> =>
        this.retryTabs.count()
            .describedAs('retry tab count');

    /**
     * The label text of the currently active retry attempt tab (e.g. `'Attempt 2'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.activeAttemptLabel(), equals('Attempt 2'))
     * ```
     */
    activeAttemptLabel = (): QuestionAdapter<string> =>
        this.children(By.css('.retry-tab.active')).first().text().trim()
            .describedAs('active attempt tab label');

    /**
     * The `src` attribute of the embedded video's `<source>` element.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.videoSource(), includes('.webm'))
     * ```
     */
    videoSource = (): QuestionAdapter<string> =>
        Attribute.called('src').of(this.child(By.css('video source')))
            .describedAs('video source URL');

    /**
     * Whether a video element is present in the detail view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.hasVideo(), equals(true))
     * ```
     */
    hasVideo = (): Question<Promise<boolean>> =>
        this.child(By.css('video')).isPresent()
            .describedAs('whether video is present');

    /**
     * The metadata text below the scenario title (duration, tags, etc.).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.metaText(), includes('2.4s'))
     * ```
     */
    metaText = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-detail-meta')).text().trim()
            .describedAs('scenario detail meta text');

    /**
     * The full text content of the activity tree section.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.activityTreeText(), includes('clicks on'))
     * ```
     */
    activityTreeText = (): QuestionAdapter<string> =>
        this.child(By.css('.activity-tree')).text().trim()
            .describedAs('activity tree text');

    /**
     * The label text of the first retry tab.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.firstRetryTabLabel(), equals('Attempt 1'))
     * ```
     */
    firstRetryTabLabel = (): QuestionAdapter<string> =>
        this.retryTabs.first().text().trim()
            .describedAs('first retry tab label');

    /**
     * The label text of the last retry tab.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenarioDetailView.lastRetryTabLabel(), equals('Attempt 3'))
     * ```
     */
    lastRetryTabLabel = (): QuestionAdapter<string> =>
        this.retryTabs.last().text().trim()
            .describedAs('last retry tab label');

    // Behaviour — tasks

    /**
     * Clicks the copy source location button.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenarioDetailView.copySourceLocation(),
     * );
     * ```
     */
    copySourceLocation = (): Task =>
        Task.where('#actor copies the source location',
            Click.on(this.copyButton),
        );

    /**
     * Opens the photo lightbox by clicking a thumbnail at the given index.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenarioDetailView.openPhotoAt(0),
     * );
     * ```
     *
     * @param index
     *  Zero-based index of the photo thumbnail to click
     */
    openPhotoAt = (index: number): Task =>
        Task.where(`#actor opens photo at index ${ index }`,
            Click.on(
                this.children(By.css('.photo-strip-item img'))
                    .nth(index)
                    .describedAs(`photo thumbnail #${ index }`)
            ),
        );

    /**
     * Switches to a retry attempt tab by its number.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenarioDetailView.switchToAttempt(2),
     *   Ensure.that(scenarioDetailView.activeAttemptLabel(), equals('Attempt 2')),
     * );
     * ```
     *
     * @param attemptNumber
     *  The attempt number (1-based) to switch to
     */
    switchToAttempt = (attemptNumber: number): Task =>
        Task.where(`#actor switches to attempt ${ attemptNumber }`,
            Click.on(
                this.retryTabs
                    .where(Text, includes(`Attempt ${ attemptNumber }`))
                    .first()
                    .describedAs(`retry tab for attempt ${ attemptNumber }`)
            ),
        );

    /**
     * Navigates to the Scenario Detail view via the sidebar navigation.
     *
     * Note: in most tests you navigate to the detail view via
     * {@link ScenarioItem.viewDetails} rather than calling `open()` directly.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenarioDetailView.open(),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Scenario Detail view',
            this.navigation.openView('Test Scenarios'),
        );
}
