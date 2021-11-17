import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';

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
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class Form {
 *      static submitButton = Target.the('submit button')
 *          .located(by.id('submit'));
 *  }
 *
 * @example <caption>Scrolling to element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, Scroll, isVisible } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Sara')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
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
export class Scroll extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<PageElement>} target
     *  The element to be scroll to
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static to(target: Answerable<PageElement>): Scroll {
        return new Scroll(target);
    }

    /**
     * @param {Answerable<PageElement>} target
     *  The element to be scroll to
     */
    constructor(private readonly target: Answerable<PageElement>) {
        super();
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
        const target = await actor.answer(this.target);

        return target.scrollIntoView();
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor scrolls to ${ this.target }`;
    }
}
