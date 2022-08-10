import { Answerable, AnswersQuestions, d, Interaction, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Instructs an {@link Actor|actor} who has the {@link Ability|ability} to {@link BrowseTheWeb}
 * to scroll until a given Web element comes into view.
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
 * - {@link BrowseTheWeb}
 * - {@link PageElement}
 *
 * @group Interactions
 */
export class Scroll extends Interaction {

    /**
     * Instantiates this {@link Interaction}.
     *
     * @param pageElement
     *  The element to scroll to
     */
    static to(pageElement: Answerable<PageElement>): Scroll {
        return new Scroll(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super();
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const target = await actor.answer(this.element);

        return target.scrollIntoView();
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return d`#actor scrolls to ${ this.element }`;
    }
}
