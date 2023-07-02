import type { Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { d, Interaction } from '@serenity-js/core';

import type { PageElement } from '../models';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to scroll until a given {@apilink PageElement} comes into view.
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink PageElement}
 *
 * @group Activities
 */
export class Scroll extends Interaction {

    /**
     * Instantiates this {@apilink Interaction}.
     *
     * @param pageElement
     *  The element to scroll to
     */
    static to(pageElement: Answerable<PageElement>): Scroll {
        return new Scroll(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super(d`#actor scrolls to ${ element }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const target = await actor.answer(this.element);
        await target.scrollIntoView();
    }
}
