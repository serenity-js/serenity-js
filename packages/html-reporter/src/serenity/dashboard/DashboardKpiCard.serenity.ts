import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

/**
 * Interaction object representing a single clickable **KPI card** on the {@link DashboardView}.
 *
 * Each card displays a metric label, a primary value, and an optional subtitle.
 * Clicking a card navigates to the relevant filtered view (e.g., clicking "Pass Rate"
 * opens the Test Scenarios view filtered to passing tests).
 *
 * A `DashboardKpiCard` is not instantiated directly — it is obtained via
 * {@link DashboardView.kpiCardCalled} or {@link DashboardView.kpiCardAt}:
 *
 * ```ts
 * const passRateCard = dashboardView.kpiCardCalled('Pass Rate');
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   dashboardView.open(),
 *   Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), equals('93%')),
 *   Ensure.that(dashboardView.kpiCardCalled('Pass Rate').subtitle(), includes('of 42 scenarios')),
 *   dashboardView.kpiCardCalled('Pass Rate').viewDetails(),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class DashboardKpiCard<NET> extends InteractionObject<NET> {

    private labelElement = () =>
        this.rootElement.element(By.css('.kpi-label'))
            .describedAs('dashboard KPI card label');

    private valueElement = () =>
        this.rootElement.element(By.css('.kpi-value'))
            .describedAs('dashboard KPI card value');

    private subtitleElement = () =>
        this.rootElement.element(By.css('.kpi-subtitle'))
            .describedAs('dashboard KPI card subtitle');

    /**
     * The KPI card's label text (e.g. `'PASS RATE'`, `'TOTAL TESTS'`).
     *
     * Note: labels render in uppercase via CSS `text-transform` — comparison values
     * must match the rendered case.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(kpiCard.label(), equals('PASS RATE'))
     * ```
     */
    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('dashboard KPI card label');

    /**
     * The KPI card's primary value (e.g. `'93%'`, `'42'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), equals('93%'))
     * ```
     */
    value = (): QuestionAdapter<string> =>
        this.valueElement().text().trim()
            .describedAs('dashboard KPI card value');

    /**
     * The KPI card's subtitle text (e.g. `'39 of 42 scenarios passed'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(dashboardView.kpiCardCalled('Pass Rate').subtitle(), includes('of 42 scenarios'))
     * ```
     */
    subtitle = (): QuestionAdapter<string> =>
        this.subtitleElement().text().trim()
            .describedAs('dashboard KPI card subtitle');

    /**
     * The KPI card's `aria-label` attribute, providing full context for screen readers.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(kpiCard.accessibleLabel(), includes('Pass Rate: 93%'))
     * ```
     */
    accessibleLabel = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.rootElement)
            .describedAs('dashboard KPI card accessible label');

    /**
     * Clicks the KPI card to navigate to its associated detail view.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   dashboardView.kpiCardCalled('Failed').viewDetails(),
     *   Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
     * );
     * ```
     */
    viewDetails = (): Task =>
        Task.where(the`#actor views KPI card details`,
            Click.on(this.rootElement),
        );
}
