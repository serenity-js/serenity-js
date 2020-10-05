import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  perform a double-click on a given Web element.
 *
 * @example <caption>Example widget</caption>
 *  <!--
 *      The editor shows up when the user double-clicks
 *      on one of the properties of their profile
 *      and let's them change the value of that property.
 *  -->
 *  <div id="user-profile">
 *      <ul>
 *          <li id="display-name" ondblclick="edit(this)">User12345</li>
 *          <li id="email-address" ondblclick="edit(this)">tester@example.org</li>
 *      </ul>
 *      <form id="editor" class="hidden">
 *          <input type="text" value="" />
 *      </form>
 *  </div>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class UserProfile {
 *      static displayName = Target.the('display name')
 *          .located(by.id('display-name'));
 *      static emailAddress = Target.the('email address')
 *          .located(by.id('email-address'));
 *      static editor = Target.the('editor')
 *          .located(by.id('editor'));
 *  }
 *
 * @example <caption>Double-clicking on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, DoubleClick, isVisible, Enter, Text, Wait } from '@serenity-js/protractor';
 *  import { Ensure, equals, not } from '@serenity-js/assertions';
 *  import { protractor, Key } from 'protractor';
 *
 *  actorCalled('Dorothy')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          DoubleClick.on(UserProfile.displayName),
 *          Wait.until(UserProfile.editor, isVisible()),
 *
 *          Enter.theValue('New username').into(UserProfile.editor),
 *          Press.the(Key.ENTER).in(UserProfile.editor),
 *
 *          Ensure.that(Text.of(UserProfile.displayName), equals('New username')),
 *          Ensure.that(UserProfile.editor, not(isVisible()))
 *      );
 *
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class DoubleClick extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be double-clicked on
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static on(target: Question<ElementFinder> | ElementFinder): Interaction {
        return new DoubleClick(target);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     *  The element to be double-clicked on
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
        // Since the deprecation of Webdriver's ControlFlow,
        // Protractor's doubleClick might behave incorrectly when promises are used.
        // The mouseMove/doubleClick combo works around that problem.
        // See https://github.com/angular/protractor/issues/4578

        return withAnswerOf(actor, this.target, (elf: ElementFinder) =>
            BrowseTheWeb.as(actor).actions()
                .mouseMove(elf)
                .perform()
                .then(() => BrowseTheWeb.as(actor).actions().doubleClick().perform()));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
