import type { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { the } from '@serenity-js/core';

import type { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to hover the mouse pointer over a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Example widget
 * ```html
 *  <a data-test="example-link"
 *      class="off"
 *      onmouseover="this.className='on';"
 *      onmouseout="this.className='off';"
 *      href="/">hover over me</a>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * class Example {
 *   static link = () =>
 *     PageElement.located(By.css('[data-test="example-link"]'))
 *       .describedAs('example link')
 *  }
 * ```
 *
 * ## Hovering over an element
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Hover, CssClasses } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Hank')
 *   .whoCan(BrowseTheWeb.using(browser))
 *   .attemptsTo(
 *      Ensure.that(CssClasses.of(Example.link()), equals([ 'off' ])),
 *
 *     Hover.over(Example.link),
 *     Ensure.that(CssClasses.of(Example.link()), equals([ 'on' ])),
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
export class Hover extends PageElementInteraction {

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/)
     *
     * @param pageElement
     *  The element to be hovered over
     */
    static over(pageElement: Answerable<PageElement>): Interaction {
        return new Hover(pageElement);
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super(the `#actor hovers the mouse over ${ element }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.element);
        await element.scrollIntoView();
        await element.hoverOver();
    }
}
