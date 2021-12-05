import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  hover the mouse pointer over a given Web element.
 *
 * @example <caption>Example widget</caption>
 *  <a data-test="example-link"
 *      class="off"
 *      onmouseover="this.className='on';"
 *      onmouseout="this.className='off';"
 *      href="/">hover over me</a>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Example {
 *      static link = Target.the('example link')
 *          .located(by.css('[data-test="example-link"]'));
 *  }
 *
 * @example <caption>Hovering over an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Hover, CssClasses } from '@serenity-js/webdriverio';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  actorCalled('Hank')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(CssClasses.of(Example.link), equals([ 'off' ])),
 *
 *          Hover.over(Example.link),
 *          Ensure.that(CssClasses.of(Example.link), equals([ 'on' ])),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link CssClasses}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions/lib/expectations~equals}
 *
 * @extends {ElementInteraction}
 */
export class Hover extends PageElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<PageElement>} target
     *  The element to be hovered over
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static over(target: Answerable<PageElement>): Interaction {
        return new Hover(target);
    }

    /**
     * @param {Answerable<PageElement>} target
     *  The element to be hovered over
     */
    constructor(private readonly target: Answerable<PageElement>) {
        super(formatted `#actor hovers the mouse over ${ target }`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.target);
        return element.hoverOver();
    }
}
