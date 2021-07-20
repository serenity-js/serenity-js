import {
    Answerable,
    AnswersQuestions,
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

import { DoubleClickOptions } from '../options/clickOptions';

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
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class UserProfile {
 *      static displayName = Target.the('display name')
 *          .selectedBy('[id="display-name"]');
 *      static emailAddress = Target.the('email address')
 *          .selectedBy('[id="email-address"]');
 *      static editor = Target.the('editor')
 *          .selectedBy('[id="editor"]');
 *  }
 *
 * @example <caption>Double-clicking on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, DoubleClick, isVisible, Enter, Text, Wait } from '@serenity-js/playwright';
 *  import { Ensure, equals, not } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Dorothy')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          DoubleClick.on(UserProfile.displayName),
 *          Wait.until(UserProfile.editor, isVisible()),
 *
 *          Enter.theValue('New username').into(UserProfile.editor),
 *          Press.the('Enter').in(UserProfile.editor),
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
   * @param {Answerable<ElementHandle>} target
   *  The element to be double-clicked on
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static on(target: Answerable<ElementHandle>): Interaction & {
        withOptions: (options: DoubleClickOptions) => Interaction;
    } {
        return new DoubleClick(target);
    }

    private constructor(
        private readonly target: Answerable<ElementHandle>,
        private readonly options?: DoubleClickOptions
    ) {
        super();
    }

    public withOptions(options: DoubleClickOptions): Interaction {
        return new DoubleClick(this.target, options);
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
    public async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const targetAnswered = await actor.answer(this.target);

        await targetAnswered.dblclick(this.options);
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return formatted`#actor clicks on ${this.target}`;
    }
}
