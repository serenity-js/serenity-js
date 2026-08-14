import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

/**
 * Interaction object representing the **About** view in the HTML report.
 *
 * Shows project information, links to documentation, and version details.
 *
 * ## Instantiation
 *
 * ```ts
 * import { AboutView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const aboutView = new AboutView(
 *   PageElement.located(By.css('[data-testid="about"]')).describedAs('about view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   aboutView.open(),
 *   Ensure.that(aboutView.bodyText(), includes('Serenity/JS')),
 *   Ensure.that(aboutView.hasLinkTo('https://serenity-js.org'), equals(true)),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class AboutView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    /**
     * The full body text of the about view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(aboutView.bodyText(), includes('Serenity/JS'))
     * ```
     */
    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('about view body text');

    /**
     * Whether the about view contains a link with the given URL.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(aboutView.hasLinkTo('https://serenity-js.org'), equals(true))
     * ```
     *
     * @param url
     *  The exact `href` value to check for
     */
    hasLinkTo = (url: string): Question<Promise<boolean>> =>
        this.child(By.css(`a[href="${url}"]`))
            .isPresent()
            .describedAs(`whether the about view has a link to ${url}`);

    /**
     * Navigates to the About view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   aboutView.open(),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the About view',
            this.navigation.openView('About'),
        );
}
