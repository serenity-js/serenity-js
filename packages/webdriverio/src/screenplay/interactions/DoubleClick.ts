import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { WebElementInteraction } from './WebElementInteraction';

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
 *  import { by, Target } from '@serenity-js/webdriverio';
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
 *  import { BrowseTheWeb, DoubleClick, isVisible, Enter, Text, Wait } from '@serenity-js/webdriverio';
 *  import { Ensure, equals, not } from '@serenity-js/assertions';
 *
 *  actorCalled('Dorothy')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          DoubleClick.on(UserProfile.displayName),
 *          Wait.until(UserProfile.editor, isVisible()),
 *
 *          Enter.theValue('New username').into(UserProfile.editor),
 *
 *          Ensure.that(Text.of(UserProfile.displayName), equals('New username')),
 *          Ensure.that(UserProfile.editor, not(isVisible()))
 *      );
 *
 * @see {@link Target}
 *
 * @extends {WebElementInteraction}
 */
export class DoubleClick extends WebElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<Element<'async'>>} target
     *  The element to be double-clicked on
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static on(target: Answerable<Element<'async'>>): Interaction {
        return new DoubleClick(target);
    }

    /**
     * @param {Answerable<Element<'async'>>} target
     *  The element to be double-clicked on
     */
    constructor(private readonly target: Answerable<Element<'async'>>) {
        super(formatted `#actor double-clicks on ${ target }`);
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
        return element.doubleClick();
    }
}
