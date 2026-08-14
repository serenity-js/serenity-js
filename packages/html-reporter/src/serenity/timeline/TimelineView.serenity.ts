import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Click, PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { KpiCard } from '../common/KpiCard.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

/**
 * Interaction object representing the **Timeline** view in the HTML report.
 *
 * Visualises execution timing across scenarios, showing when each test started and
 * how long it took. Includes KPI cards summarising timing metrics and filter chips
 * to focus on specific outcome types.
 *
 * Composes child interaction objects ({@link FilterBar}, {@link KpiCard})
 * for individual UI widgets.
 *
 * On mobile viewports, filter controls live inside a bottom sheet. The same
 * `selectFilter()` method works regardless of viewport size when the
 * `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { TimelineView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const timelineView = new TimelineView(
 *   PageElement.located(By.css('[data-testid="timeline"]')).describedAs('timeline view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   timelineView.open(),
 *   Ensure.that(timelineView.scenarioCount(), isGreaterThan(0)),
 *   timelineView.selectFilter('Failed'),
 *   Ensure.that(timelineView.activeFilters(), equals(['Failed'])),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class TimelineView<NET> extends InteractionObject<NET> {

    // Structure — child interaction objects
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));

    // Structure — mobile child interaction objects
    private readonly mobileFilterBar = new FilterBar<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="filter-bar"]'))
    );

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="kpi-card"]')).describedAs('timeline KPI cards');

    constructor(
        rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>,
        private readonly navigation: Navigation = new Navigation(),
        options?: InteractionObjectOptions,
    ) {
        super(rootElement, options);
    }

    // Mobile helpers

    private filterSheetTrigger = () =>
        this.child(By.css('[aria-label="Search and filter"]'))
            .describedAs('filter sheet trigger');

    private bottomSheetClose = () =>
        this.child(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close'))
            .describedAs('bottom sheet close button');

    private openFilterSheet = (): Task =>
        Task.where('#actor opens the filter sheet',
            Click.on(this.filterSheetTrigger()),
        );

    private closeFilterSheet = (): Task =>
        Task.where('#actor closes the filter sheet',
            Click.on(this.bottomSheetClose()),
        );

    // Behaviour — questions

    /**
     * Returns the {@link KpiCard} at the given zero-based index.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(timelineView.kpiCardAt(0).value(), includes('42'))
     * ```
     *
     * @param index
     *  Zero-based position of the KPI card
     */
    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.kpiCards.nth(index));

    /**
     * Locates a {@link KpiCard} by its label text.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(timelineView.kpiCardCalled('Total Duration').value(), includes('5m'))
     * ```
     *
     * @param label
     *  Substring to match against KPI card labels (case-insensitive)
     */
    kpiCardCalled = (label: string): KpiCard<NET> => {
        const cardElement = this.kpiCards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new KpiCard(cardElement);
    };

    /**
     * The labels of the currently active (pressed) filter chips.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   timelineView.selectFilter('Failed'),
     *   Ensure.that(timelineView.activeFilters(), equals(['Failed'])),
     * );
     * ```
     */
    activeFilters = (): Question<Promise<string[]>> =>
        this.filterBar.activeFilters();

    /**
     * The number of timeline rows currently visible.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(timelineView.scenarioCount(), equals(42))
     * ```
     */
    scenarioCount = (): Question<Promise<number>> =>
        this.children(By.css('.timeline-row')).count()
            .describedAs('timeline scenario count');

    // Behaviour — tasks

    /**
     * Activates a filter chip by label (e.g. `'Failed'`, `'Passed'`).
     *
     * On mobile viewports, opens the bottom sheet to access filters.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   timelineView.selectFilter('Failed'),
     *   Ensure.that(timelineView.scenarioCount(), equals(5)),
     * );
     * ```
     *
     * @param label
     *  The filter chip label to activate
     */
    selectFilter = (label: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor selects the ${label} filter`,
                this.openFilterSheet(),
                this.mobileFilterBar.selectFilter(label),
                this.closeFilterSheet(),
            )
            : this.filterBar.selectFilter(label);

    /**
     * Navigates to the Timeline view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   timelineView.open(),
     *   Ensure.that(timelineView.scenarioCount(), isGreaterThan(0)),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Timeline view',
            this.navigation.openView('Timeline'),
        );
}
