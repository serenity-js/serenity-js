import type { QuestionAdapter } from '@serenity-js/core';
import { By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

/**
 * Interaction object representing a collapsible panel showing HTTP request/response
 * details captured during test execution.
 *
 * REST query panels appear inline within the activity tree of a scenario detail view,
 * displaying the HTTP method, URL, and response status code of API interactions
 * recorded by the `@serenity-js/rest` module.
 *
 * ## Instantiation (within a parent interaction object)
 *
 * ```ts
 * import { RestQueryPanel } from '@serenity-js/html-reporter/serenity';
 * import { By } from '@serenity-js/web';
 *
 * export class ActivityItem<NET> extends InteractionObject<NET> {
 *   readonly restPanel = new RestQueryPanel(this.rootElement.element(By.css('[data-testid="rest-panel"]')));
 * }
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(restPanel.method(), equals('POST')),
 *   Ensure.that(restPanel.url(), includes('/api/checkout')),
 *   Ensure.that(restPanel.statusCode(), equals('201')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class RestQueryPanel<NET> extends InteractionObject<NET> {

    /**
     * The HTTP method of the captured request (e.g. `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(restPanel.method(), equals('POST')),
     * );
     * ```
     */
    method = (): QuestionAdapter<string> =>
        this.rootElement.element(By.css('[data-testid="rest-method"]')).text().trim()
            .describedAs('REST query HTTP method');

    /**
     * The request URL of the captured HTTP interaction.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(restPanel.url(), includes('/api/checkout')),
     * );
     * ```
     */
    url = (): QuestionAdapter<string> =>
        this.rootElement.element(By.css('[data-testid="rest-url"]')).text().trim()
            .describedAs('REST query URL');

    /**
     * The HTTP response status code (e.g. `'200'`, `'404'`, `'500'`).
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(restPanel.statusCode(), equals('201')),
     * );
     * ```
     */
    statusCode = (): QuestionAdapter<string> =>
        this.rootElement.element(By.css('[data-testid="rest-status"]')).text().trim()
            .describedAs('REST query status code');
}
