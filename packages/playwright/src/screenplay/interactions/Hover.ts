import {
    Answerable,
    AnswersQuestions,
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

import { HoverOptions } from '../options/hoverOptions';

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
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class Example {
 *      static link = Target.the('example link')
 *          .located('data-test=example-link');
 *  }
 *
 * @example <caption>Hovering over an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Hover, CSSClasses } from '@serenity-js/playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Hank')
 *      .whoCan(BrowseTheWeb.using(chromium))
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
    static over(target: Answerable<ElementHandle>): Interaction & {
        withOptions: (options: HoverOptions) => Interaction;
    } {
        return new Hover(target);
    }

    protected constructor(
        private readonly target: Answerable<ElementHandle>,
        private readonly options?: HoverOptions
    ) {
        super();
    }

    public withOptions(options: HoverOptions): Interaction {
        return new Hover(this.target, options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const targetAnswered = await actor.answer(this.target);

        await targetAnswered.hover(this.options);
    }

    toString(): string {
        return formatted`#actor clicks on ${this.target}`;
    }
}
