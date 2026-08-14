import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

/**
 * Interaction object representing a single **consistency item** row in the
 * {@link DashboardView} consistency summary card.
 *
 * A `ConsistencyItem` is not instantiated directly — it is obtained via
 * {@link DashboardView.consistencyItemCalled}:
 *
 * ```ts
 * const item = dashboardView.consistencyItemCalled('Flaky Test');
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   dashboardView.consistencyItemCalled('Flaky Test').viewDetails(),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ConsistencyItem<NET> extends InteractionObject<NET> {

    /**
     * Clicks the consistency item to navigate to its detail view.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   dashboardView.consistencyItemCalled('Flaky Test').viewDetails(),
     * );
     * ```
     */
    viewDetails = (): Task =>
        Task.where('#actor views consistency item details',
            Click.on(this.rootElement),
        );
}
