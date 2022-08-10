import { Answerable, AnswersQuestions, d, Interaction, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an {@link Actor|actor} who has the {@link Ability|ability} to {@link BrowseTheWeb}
 * to perform a double click on a given {@link PageElement}.
 *
 * ## Example widget
 * ```html
 * <!--
 *     The editor shows up when the user double-clicks
 *     on one of the properties of their profile
 *     and lets them change the value of that property.
 * -->
 * <div id="user-profile">
 *     <ul>
 *         <li id="display-name" ondblclick="edit(this)">User12345</li>
 *         <li id="email-address" ondblclick="edit(this)">tester@example.org</li>
 *     </ul>
 *     <form id="editor" class="hidden">
 *         <input type="text" value="" />
 *     </form>
 * </div>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * class UserProfile {
 *   static displayName = () =>
 *     PageElement.located(by.id('display-name'))
 *       .describedAs('display name')
 *
 *   static emailAddress = () =>
 *     PageElement.located(by.id('email-address'))
 *       .describedAs('email address')
 *
 *   static editor = () =>
 *     PageElement.located(by.id('editor'))
 *       .describedAs('editor')
 * }
 * ```
 *
 * ## Double-clicking on an element
 * ```ts
 * import { actorCalled, Wait } from '@serenity-js/core'
 * import { DoubleClick, isVisible, Enter, Text } from '@serenity-js/web'
 * import { Ensure, equals, not } from '@serenity-js/assertions'
 *
 * await actorCalled('Dorothy')
 *   .whoCan(BrowseTheWeb.using(browser))
 *   .attemptsTo(
 *     DoubleClick.on(UserProfile.displayName),
 *     Wait.until(UserProfile.editor(), isVisible()),
 *
 *     Enter.theValue('New username').into(UserProfile.editor),
 *
 *     Ensure.that(Text.of(UserProfile.displayName()), equals('New username')),
 *     Ensure.that(UserProfile.editor, not(isVisible()))
 *   )
 * ```
 *
 * ## Learn more
 *
 * - {@link BrowseTheWeb}
 * - {@link PageElement}
 *
 * @group Interactions
 */
export class DoubleClick extends PageElementInteraction {

    /**
     * Instantiates this {@link Interaction}.
     *
     * @param pageElement
     *  The element to be double-clicked on
     */
    static on(pageElement: Answerable<PageElement>): Interaction {
        return new DoubleClick(pageElement);
    }

    protected constructor(private readonly pageElement: Answerable<PageElement>) {
        super(d `#actor double-clicks on ${ pageElement }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.pageElement);
        return element.doubleClick();
    }
}
