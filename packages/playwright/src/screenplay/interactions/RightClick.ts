import {
    Answerable,
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

import { RightClickOptions } from '../options/clickOptions';

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
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .selectedBy('id=example'));
 *      static exampleContextMenu = Target.the('example context menu')
 *          .selectedBy('id=example'));
 *  }
 *
 * @example <caption>Right-click on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, RightClick, isVisible } from '@serenity-js/playwright';
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { firefox } from 'playwright';
 *
 *  actorCalled('Chloé')
 *      .whoCan(BrowseTheWeb.using(firefox))
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
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class RightClick extends Interaction {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {Answerable<ElementHandle>} target
   *  The element to be right clicked on
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static on(target: Answerable<ElementHandle>): Interaction {
        return new RightClick(target);
    }

    /**
   * @param {Answerable<ElementHandle>} target
   *  The element to be right clicked on
   */
    protected constructor(
        protected readonly target: Answerable<ElementHandle>,
        protected readonly options?: RightClickOptions
    ) {
        super();
    }

    public withOptions(options: RightClickOptions): Interaction {
        return new RightClick(this.target, options);
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
        const targetAnswered = await actor.answer(this.target);

        await targetAnswered.click({
            button: 'right',
            ...this.options,
        });
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return formatted`#actor right clicks on ${this.target}`;
    }
}
