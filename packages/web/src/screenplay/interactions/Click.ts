import type { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { the } from '@serenity-js/core';

import type { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to scroll the given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) into view and then [click](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) on it.
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
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * @group Activities
 */
export class Click extends PageElementInteraction {

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     *
     * @param pageElement
     *  The element to be clicked on
     */
    static on(pageElement: Answerable<PageElement>): Interaction {
        return new Click(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super(the `#actor clicks on ${ element }`);
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
