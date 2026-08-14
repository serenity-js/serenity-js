import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

/**
 * Interaction object representing a Key Performance Indicator card displaying
 * a metric with label, value, and subtitle.
 *
 * KPI cards appear on the Dashboard view, presenting at-a-glance metrics
 * like pass rate, total scenarios, and confidence score. Each card is clickable
 * and navigates to a filtered view of the relevant data.
 *
 * A `KpiCard` is not instantiated directly — it is obtained via
 * a parent view's parameterised locator (e.g. `dashboardView.kpiCardCalled('Pass Rate')`).
 *
 * ## Usage in a test
 *
 * ```ts
 * const passRateCard = dashboardView.kpiCardCalled('Pass Rate');
 *
 * await actor.attemptsTo(
 *   Ensure.that(passRateCard.label(), equals('PASS RATE')),
 *   Ensure.that(passRateCard.value(), equals('93%')),
 *   Ensure.that(passRateCard.subtitle(), includes('of 100 scenarios')),
 *   Ensure.that(passRateCard.accessibleLabel(), includes('Pass Rate')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class KpiCard<NET> extends InteractionObject<NET> {

    private labelElement = () =>
        this.child(By.css('.kpi-label'))
            .describedAs('KPI card label');

    private valueElement = () =>
        this.child(By.css('.kpi-value'))
            .describedAs('KPI card value');

    private subtitleElement = () =>
        this.child(By.css('.kpi-subtitle'))
            .describedAs('KPI card subtitle');

    /**
     * The KPI metric name displayed on the card (e.g. `'PASS RATE'`, `'TOTAL SCENARIOS'`).
     *
     * Note: `text-transform: uppercase` in CSS means the rendered text is uppercase
     * regardless of the source markup.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(kpiCard.label(), equals('PASS RATE')),
     * );
     * ```
     */
    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('KPI card label');

    /**
     * The displayed metric value (e.g. `'93%'`, `'142'`, `'87.5'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(kpiCard.value(), equals('93%')),
     * );
     * ```
     */
    value = (): QuestionAdapter<string> =>
        this.valueElement().text().trim()
            .describedAs('KPI card value');

    /**
     * Additional context displayed below the value (e.g. `'93 of 100 scenarios passed'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(kpiCard.subtitle(), includes('of 100 scenarios')),
     * );
     * ```
     */
    subtitle = (): QuestionAdapter<string> =>
        this.subtitleElement().text().trim()
            .describedAs('KPI card subtitle');

    /**
     * The `aria-label` attribute of the card's root element, providing
     * an accessible description for assistive technology.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(kpiCard.accessibleLabel(), includes('Pass Rate: 93%')),
     * );
     * ```
     */
    accessibleLabel = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.rootElement)
            .describedAs('KPI card accessible label');
}
