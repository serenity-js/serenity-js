import type { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { d } from '@serenity-js/core';

import type { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to scroll the given {@apilink PageElement} into view and then [click](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) on it.
 *
 * ## Example widget
 *
 * ```html
 * <form>
 *   <input type="text" name="example" id="example" />
 * </form>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/webdriverio';
 *
 * class Form {
 *   static exampleInput = () =>
 *     PageElement.located(by.id('example'))
 *       .describedAs('example input')
 * }
 * ```
 *
 * ## Clicking on an element
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Click, isSelected } from '@serenity-js/web'
 * import { Ensure } from '@serenity-js/assertions'
 *
 * await actorCalled('Chloé')
 *   .attemptsTo(
 *     Click.on(Form.exampleInput()),
 *     Ensure.that(Form.exampleInput(), isSelected()),
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
export class Click extends PageElementInteraction {

    /**
     * Instantiates this {@apilink Interaction}.
     *
     * @param pageElement
     *  The element to be clicked on
     */
    static on(pageElement: Answerable<PageElement>): Interaction {
        return new Click(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super(d `#actor clicks on ${ element }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.element);
        await element.scrollIntoView();
        await element.click();
    }
}
