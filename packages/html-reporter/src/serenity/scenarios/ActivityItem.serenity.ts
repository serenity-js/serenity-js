import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

/**
 * Interaction object representing a single **activity row** in the scenario detail activity tree.
 *
 * An `ActivityItem` is not instantiated directly — it is obtained via
 * {@link ScenarioDetailView.activityCalled}, which locates the matching row
 * by activity name:
 *
 * ```ts
 * const activity = scenarioDetailView.activityCalled('Alice clicks on the submit button');
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(scenarioDetailView.activityCalled('Alice enters "hello"').outcome(), equals('SUCCESS')),
 *   Ensure.that(scenarioDetailView.activityCalled('Alice clicks submit').outcome(), equals('FAILURE')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ActivityItem<NET> extends InteractionObject<NET> {

    private activityIcon = () =>
        this.child(By.css('.activity-icon'))
            .describedAs('activity icon');

    /**
     * The activity's display name (e.g. `'Alice clicks on the submit button'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(activity.name(), includes('clicks on the submit button'))
     * ```
     */
    name = (): QuestionAdapter<string> =>
        this.child(By.css('.activity-name')).text().trim()
            .describedAs('activity name');

    /**
     * The activity's execution outcome (e.g. `'SUCCESS'`, `'FAILURE'`, `'ERROR'`).
     *
     * Reads the `data-outcome` attribute from the activity icon element.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(activity.outcome(), equals('FAILURE'))
     * ```
     */
    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.activityIcon())
            .describedAs('activity outcome');
}
