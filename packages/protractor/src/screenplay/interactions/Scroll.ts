import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

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
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be scroll to
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static to(target: Question<ElementFinder> | ElementFinder): Scroll {
        return new Scroll(target);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be scroll to
     */
    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
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
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return withAnswerOf(actor, this.target, (elf: ElementFinder) => BrowseTheWeb.as(actor).actions().mouseMove(elf).perform());
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor scrolls to ${this.target}`;
    }
}
