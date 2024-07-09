import type { Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Interaction, the } from '@serenity-js/core';

import type { PageElement } from '../models';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to scroll until a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) comes into view.
 *
 * ## Example widget
 *
 * ```html
 * <!--
 *   an element somewhere at the bottom of the page,
 *   outside of the visible area
 * -->
 * <input type="submit" id="submit" />
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * class Form {
 *   static submitButton = () => {
 *     PageElement.located(By.id('submit'))
 *       .describedAs('submit button')
 * }
 * ```
 *
 * ## Scrolling to element
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure } from '@serenity-js/assertions'
 * import { Scroll, isVisible } from '@serenity-js/web'
 *
 * await actorCalled('Sara')
 *   .attemptsTo(
 *     Scroll.to(Form.submitButton()),
 *     Ensure.that(Form.submitButton(), isVisible()),
 *   )
 * ```
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * @group Activities
 */
export class Scroll extends Interaction {

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     *
     * @param pageElement
     *  The element to scroll to
     */
    static to(pageElement: Answerable<PageElement>): Scroll {
        return new Scroll(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super(the`#actor scrolls to ${ element }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const pageElement = await actor.answer(this.element);
        await pageElement.scrollIntoView();
    }
}
