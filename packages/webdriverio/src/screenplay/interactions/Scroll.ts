import { Answerable, AnswersQuestions, Interaction,  UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { WebElementInteraction } from './WebElementInteraction';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  scroll until a given Web element comes into view.
 *
 * @example <caption>Example widget</caption>
 *  <!--
 *      an element somewhere at the bottom of the page,
 *      outside of the visible area
 *  -->
 *  <input type="submit" id="submit" />
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Form {
 *      static submitButton = Target.the('submit button')
 *          .located(by.id('submit'));
 *  }
 *
 * @example <caption>Scrolling to element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, Scroll, isVisible } from '@serenity-js/webdriverio';
 *
 *  actorCalled('Sara')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Scroll.to(Form.submitButton),
 *          Ensure.that(Form.submitButton, isVisible()),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link isVisible}
 * @see {@link @serenity-js/assertions~Ensure}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Scroll extends WebElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<Element<'async'>>} target
     *  The element to be scrolled to
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static to(target: Answerable<Element<'async'>>) : Interaction {
        return new Scroll(target);
    }

    /**
     * @param {Answerable<Element<'async'>>} target
     *  The element to be scrolled to
     */
    constructor(private readonly target: Answerable<Element<'async'>>) {
        super(formatted `#actor scrolls to ${ target }`);
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
        return element.scrollIntoView();
    }
}
