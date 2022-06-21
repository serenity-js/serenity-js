import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';
import { ScrollBuilder } from './ScrollBuilder';

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
 *  @example <caption>Scrolling to element view at the bottom</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, Scroll, isVisible } from '@serenity-js/webdriverio';
 *
 *  actorCalled('Sara')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Scroll.alignedToTop(false).to(Form.submitButton),
 *          Ensure.that(Form.submitButton, isVisible()),
 *      );
 *
 *  @example <caption>Scrolling to element view at the bottom</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, Scroll, isVisible } from '@serenity-js/webdriverio';
 *
 *  actorCalled('Sara')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Scroll.alignedToTop({ behavior: "smooth", block: "end", inline: "nearest" }).to(Form.submitButton),
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
     *  The element to be scrolled to
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static to(target: Answerable<PageElement>): Scroll {
        return new Scroll(target);
    }

    /**
     * @desc
     * Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
     * configured to align the element into specific part of the viewport
     *
     * @param {boolean | ScrollIntoViewOptions} alignedToTop
     * A boolean value:
     * If true, the top of the element will be aligned to the top of the visible area of the scrollable ancestor.
     * Corresponds to scrollIntoViewOptions: {block: "start", inline: "nearest"}. This is the default value.
     *
     *  If false, the bottom of the element will be aligned to the bottom of the visible area of the scrollable ancestor.
     * Corresponds to scrollIntoViewOptions: {block: "end", inline: "nearest"}.
     *
     * An Object with the following properties:
     * behavior (optional)
     * Defines the transition animation. One of auto or smooth. Defaults to auto.
     *
     * block (optional)
     * Defines vertical alignment. One of start, center, end, or nearest. Defaults to start.
     *
     * inline (optional)
     * Defines horizontal alignment. One of start, center, end, or nearest. Defaults to nearest.
     *
     * @returns {ScrollBuilder}
     */
    static alignedTo(alignedToTop: boolean | ScrollIntoViewOptions): ScrollBuilder {
        return {
            to: (target: Answerable<PageElement>): Interaction =>
                new Scroll(target, alignedToTop)
        };
    }

    /**
     * @param {Answerable<PageElement>} target
     *  The element to be scrolled to
     * @param scrollIntoViewOptions
     *  The options to place the element in the visible area
     */
    constructor(
        private readonly target: Answerable<PageElement>,
        private readonly scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
    ) {
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
     * @returns {Promise<void>}
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
        if (typeof this.scrollIntoViewOptions === 'boolean') {
            const alignedTo = this.scrollIntoViewOptions ? 'top' : 'bottom';
            return formatted`#actor scrolls to the ${alignedTo} of ${this.target} aligned to the ${alignedTo} of the visible area of the scrollable ancestor`;
        }

        if (typeof this.scrollIntoViewOptions === 'object') {
            return formatted`#actor scrolls to ${this.target} with the following view options ${JSON.stringify(this.scrollIntoViewOptions)}`;
        }

        return formatted`#actor scrolls to ${this.target}`;
    }
}
