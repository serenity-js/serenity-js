import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { WebElementInteraction } from './WebElementInteraction';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  perfom a right click on a given Web element.
 *
 *  This is typically used to open a [custom context menu](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)
 *  on a given Web element, since it's not possible to interact with the standard context menu offered by your browser
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" id="field"
 *      oncontextmenu="showMenu(); return false;" />
 *
 *    <div id="context-menu" style="display:none">
 *      Custom context menu
 *    </div>
 *  </form>
 *
 *  <script>
 *    function showMenu() {
 *      document.getElementById("context-menu").style.display = 'block';
 *    }
 *  </script>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *      static exampleContextMenu = Target.the('example context menu')
 *          .located(by.id('context-menu'));
 *  }
 *
 * @example <caption>Right-click on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, RightClick, isVisible } from '@serenity-js/webdriverio';
 *  import { Ensure } from '@serenity-js/assertions';
 *
 *  actorCalled('Chloé')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          RightClick.on(Form.exampleInput),
 *          Ensure.that(Form.exampleContextMenu, isVisible()),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link isVisible}
 *
 * @extends {WebElementInteraction}
 */
export class RightClick extends WebElementInteraction {
    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<Element<'async'>>} target
     *  The element to be right-clicked on
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static on(target: Answerable<Element<'async'>>): Interaction {
        return new RightClick(target);
    }

    /**
     * @param {Answerable<Element<'async'>>} target
     *  The element to be right-clicked on
     */
    constructor(private readonly target: Answerable<Element<'async'>>) {
        super(formatted `#actor right-clicks on ${ target }`);
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
        return element.click({ button: 'right' });
    }
}
