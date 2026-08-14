import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, PageElement, PageElements, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ConsistencyItem } from './ConsistencyItem.serenity.js';
import { DashboardKpiCard } from './DashboardKpiCard.serenity.js';

/**
 * Interaction object representing the **Dashboard** view in the HTML report.
 *
 * The Dashboard is the landing page that provides a high-level overview of test health.
 * It shows KPI cards (pass rate, total tests, confidence score), a trend chart of
 * historical results, a consistency summary highlighting flaky/degraded tests,
 * and the slowest test scenarios.
 *
 * Composes child interaction objects ({@link DashboardKpiCard}, {@link ConsistencyItem})
 * for individual widgets within the view.
 *
 * ## Instantiation
 *
 * ```ts
 * import { DashboardView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const dashboardView = new DashboardView(
 *   PageElement.located(By.css('[data-testid="dashboard"]')).describedAs('dashboard view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   dashboardView.open(),
 *   Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('75')),
 *   Ensure.that(dashboardView.consistencyCardScenarioNames(), contain('Flaky Test')),
 *   Ensure.that(dashboardView.hasTrendChart(), equals(true)),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class DashboardView<NET> extends InteractionObject<NET> {

    private static readonly statusItemNameSelector = By.css('.status-item-name');

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="dashboard-kpi-card"]')).describedAs('dashboard KPI cards');
    private readonly consistencyItems = this.children(By.css('[data-testid="dashboard-consistency-card"] .status-item')).describedAs('dashboard consistency items');
    private readonly statusItemNames = this.children(By.css('[data-testid="dashboard-consistency-card"] .status-item-name')).describedAs('dashboard consistency item names');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    /**
     * Returns the {@link DashboardKpiCard} at the given zero-based index.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.kpiCardAt(0).label(), equals('PASS RATE'))
     * ```
     *
     * @param index
     *  Zero-based position of the KPI card
     */
    kpiCardAt = (index: number): DashboardKpiCard<NET> =>
        new DashboardKpiCard(this.kpiCards.nth(index));

    /**
     * Locates a {@link DashboardKpiCard} by its label text and returns an interaction object
     * for inspecting its value, subtitle, or navigating to its detail view.
     *
     * Uses case-insensitive substring matching against the card's `.kpi-label` text.
     *
     * ## Example
     *
     * ```ts
     * const passRateCard = dashboardView.kpiCardCalled('Pass Rate');
     *
     * await actor.attemptsTo(
     *   Ensure.that(passRateCard.value(), equals('93%')),
     *   Ensure.that(passRateCard.subtitle(), includes('of 42 scenarios')),
     *   passRateCard.viewDetails(),
     * );
     * ```
     *
     * @param label
     *  Substring to match against KPI card labels (case-insensitive)
     */
    kpiCardCalled = (label: string): DashboardKpiCard<NET> => {
        const cardElement = this.kpiCards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new DashboardKpiCard(cardElement);
    };

    /**
     * The display names of all scenarios listed in the consistency summary card.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.consistencyCardScenarioNames(), contain('Flaky Test A'))
     * ```
     */
    consistencyCardScenarioNames = (): Question<Promise<string[]>> =>
        this.statusItemNames
            .eachMappedTo(Text)
            .describedAs('dashboard consistency card scenario names');

    /**
     * The history dot outcomes for a specific scenario in the consistency card.
     *
     * Returns an array of `data-outcome` attribute values (e.g. `'SUCCESS'`, `'FAILURE'`,
     * `'RETRIED_SUCCESS'`) representing the scenario's execution history across recent runs.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(
     *   dashboardView.consistencyItemHistoryOutcomes('Flaky Test'),
     *   equals(['SUCCESS', 'FAILURE', 'RETRIED_SUCCESS']),
     * )
     * ```
     *
     * @param scenarioName
     *  Substring to match against consistency item scenario names
     */
    consistencyItemHistoryOutcomes = (scenarioName: string): Question<Promise<string[]>> => {
        const item = this.consistencyItems
            .where(Text.of(PageElement.located(DashboardView.statusItemNameSelector)), includes(scenarioName))
            .first()
            .describedAs(`consistency item "${scenarioName}"`);
        const dots = PageElements.located(By.css('[data-testid="history-dots"] .history-dot')).of(item);
        return dots.eachMappedTo(Attribute.called('data-outcome'))
            .describedAs(`history dot outcomes for "${scenarioName}"`);
    };

    /**
     * Locates a {@link ConsistencyItem} by scenario name within the consistency summary card.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   dashboardView.consistencyItemCalled('Flaky Test').viewDetails(),
     * );
     * ```
     *
     * @param scenarioName
     *  Substring to match against consistency item scenario names
     */
    consistencyItemCalled = (scenarioName: string): ConsistencyItem<NET> => {
        const item = this.consistencyItems
            .where(Text.of(PageElement.located(DashboardView.statusItemNameSelector)), includes(scenarioName))
            .first()
            .describedAs(`consistency item "${scenarioName}"`);
        return new ConsistencyItem(item);
    };

    /**
     * The display names of all scenarios listed in the "slowest tests" card.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.slowestTestNames(), contain('Login should handle timeout'))
     * ```
     */
    slowestTestNames = (): Question<Promise<string[]>> =>
        this.children(By.css('[data-testid="dashboard-slowest-card"] .status-item-name'))
            .eachMappedTo(Text)
            .describedAs('dashboard slowest test names');

    /**
     * Whether the trend chart canvas element is present in the dashboard.
     *
     * The trend chart only renders when historical run data is available.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.hasTrendChart(), equals(true))
     * ```
     */
    hasTrendChart = (): Question<Promise<boolean>> =>
        this.child(By.css('.dashboard-trend-card canvas'))
            .isPresent()
            .describedAs('whether the dashboard has a trend chart');

    /**
     * Whether the chart details panel (run details overlay) is visible.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.hasDetailsPanel(), equals(false))
     * ```
     */
    hasDetailsPanel = (): Question<Promise<boolean>> =>
        PageElement.located(By.css('[data-testid="run-details-panel"]'))
            .isPresent()
            .describedAs('whether the chart details panel is visible');

    // Behaviour — tasks

    /**
     * Navigates to the Dashboard view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   dashboardView.open(),
     *   Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('93')),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Dashboard',
            this.navigation.openView('Dashboard'),
        );
}
