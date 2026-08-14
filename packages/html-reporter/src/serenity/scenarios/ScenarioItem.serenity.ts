import { includes } from '@serenity-js/assertions';
import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

/**
 * Interaction object representing a single scenario row in the {@link ScenariosView}.
 *
 * A `ScenarioItem` is not instantiated directly — it is obtained via
 * {@link ScenariosView.scenarioCalled}, which locates the matching row
 * in the scenario list using PEQL filtering:
 *
 * ```ts
 * const scenario = scenariosView.scenarioCalled('Payment should reject an expired card');
 * ```
 *
 * From there, tests can observe the scenario's state (outcome, source location, error preview)
 * and perform actions (view details, click tags).
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   scenariosView.open(),
 *   scenariosView.selectFilter('Failed'),
 *   scenariosView.find('expired card'),
 *
 *   Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
 *   Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
 *   Ensure.that(scenariosView.scenarioCalled(failingTest).errorPreview(), includes('Payment rejected')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ScenarioItem<NET> extends InteractionObject<NET> {

    // Structure — page elements
    private readonly scenarioNameElement = this.child(By.css('.scenario-name')).describedAs('scenario name element');
    private readonly outcomeBadge = this.child(By.css('[data-testid="outcome-badge"]')).describedAs('outcome badge');
    private readonly tagChips = this.children(By.css('.tag-chip, .badge-link')).describedAs('tag chips');

    // Behaviour — questions

    /**
     * The scenario's display name.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenario.name(), equals('Payment should reject an expired card'))
     * ```
     */
    name = (): QuestionAdapter<string> =>
        this.scenarioNameElement.text().trim()
            .describedAs('scenario name');

    /**
     * The scenario's execution outcome (e.g. `'SUCCESS'`, `'FAILURE'`, `'PENDING'`).
     *
     * Reads the `data-outcome` attribute from the outcome badge element,
     * which reflects the scenario's final execution result.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenario.outcome(), equals('FAILURE'))
     * ```
     */
    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.outcomeBadge)
            .describedAs('scenario outcome');

    /**
     * The scenario's source file location (e.g. `'checkout.spec.ts:42'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenario.sourceLocation(), includes('checkout.spec.ts'))
     * ```
     */
    sourceLocation = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-source')).text().trim()
            .describedAs('scenario source location');

    /**
     * The inline error preview shown for failed scenarios.
     *
     * This is the truncated error message visible in the scenario list row
     * without navigating to the detail view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenario.errorPreview(), includes('Payment rejected'))
     * ```
     */
    errorPreview = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-error-preview')).text().trim()
            .describedAs('scenario error preview');

    /**
     * Whether the scenario row is present in the DOM.
     *
     * Useful after filtering — verifies that a scenario appears (or doesn't)
     * in the filtered results.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.selectFilter('Failed'),
     *   Ensure.that(scenariosView.scenarioCalled('should pass').isPresent(), equals(false)),
     *   Ensure.that(scenariosView.scenarioCalled('should fail').isPresent(), equals(true)),
     * );
     * ```
     */
    isPresent = (): Question<Promise<boolean>> =>
        this.scenarioNameElement
            .isPresent()
            .describedAs('whether scenario is present');

    /**
     * Labels of the tag chips displayed on the scenario row.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(scenario.tagChipLabels(), contain('@smoke'))
     * ```
     */
    tagChipLabels = (): Question<Promise<string[]>> =>
        this.children(By.css('.tag-chip'))
            .eachMappedTo(Text)
            .describedAs('tag chip labels');

    // Behaviour — tasks

    /**
     * Clicks a tag chip on the scenario row, triggering tag-based filtering.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenario.clickTag('@checkout'),
     *   Ensure.that(scenariosView.scenarioCount(), equals(3)),
     * );
     * ```
     *
     * @param name
     *  The tag label text to click (substring match)
     */
    clickTag = (name: string): Task =>
        Task.where(the`#actor clicks the ${name} tag`,
            Click.on(
                this.tagChips
                    .where(Text, includes(name))
                    .first()
                    .describedAs(the`tag chip ${name}`)
            ),
        );

    /**
     * Clicks on the scenario name to navigate to the scenario detail view.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   scenariosView.scenarioCalled('Payment should reject an expired card').viewDetails(),
     *   Ensure.that(scenarioDetailView.errorMessage(), includes('Card expired')),
     * );
     * ```
     */
    viewDetails = (): Task =>
        Task.where('#actor views scenario details',
            Click.on(this.scenarioNameElement),
        );
}
