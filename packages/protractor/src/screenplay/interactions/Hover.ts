import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { WebElement } from 'selenium-webdriver';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

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
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class Example {
 *      static link = Target.the('example link')
 *          .located(by.css('[data-test="example-link"]'));
 *  }
 *
 * @example <caption>Hovering over an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Hover, CSSClasses } from '@serenity-js/protractor';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Hank')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Ensure.that(CSSClasses.of(Example.link), equals([ 'off' ])),
 *
 *          Hover.over(Example.link),
 *          Ensure.that(CSSClasses.of(Example.link), equals([ 'on' ])),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link CSSClasses}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions/lib/expectations~equals}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Hover extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be hovered over
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static over(target: Question<ElementFinder> | ElementFinder): Interaction {
        return new Hover(target);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be hovered over
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
        return withAnswerOf(actor, this.target, (elf: WebElement) => BrowseTheWeb.as(actor).actions().mouseMove(elf).perform());
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor hovers the mouse over ${this.target}`;
    }
}
