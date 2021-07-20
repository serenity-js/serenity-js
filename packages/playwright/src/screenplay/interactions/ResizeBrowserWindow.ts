import { Interaction, UsesAbilities } from '@serenity-js/core';

import { UnsupportedOperationError } from '../../errors';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  resize the browser window.
 *
 * @see {@link Window}
 */
export class ResizeBrowserWindow {
    /**
   * @deprecated Not supported in playwright
   *
   * @desc
   *  Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  setting the size of the browser window to maximum.
   */
    static toMaximum(): Interaction {
        throw new UnsupportedOperationError();
    }

    /**
   * @desc
   *  Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  setting the size of the browser window to given `width` and `height`
   *
   * @example <caption>Setting specific window size</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Navigate, ResizeBrowserWindow } from '@serenity-js/playwright';
   *  import { firefox } from 'playwright';
   *
   *  actorCalled('Ventana')
   *      .whoCan(BrowseTheWeb.using(firefox))
   *      .attemptsTo(
   *          Navigate.to('https://localhost:3000/app'),
   *          ResizeBrowserWindow.to(828, 1792),
   *      );
   *
   * @see {@link BrowseTheWeb}
   *
   * @param {number} width
   *  Desired new width of the browser window
   *
   * @param {number} height
   *  Desired new height of the browser window
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static to(width: number, height: number): Interaction {
        return new SetBrowserWindowSize(width, height);
    }
}

/**
 * @package
 */
class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {}

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
    public performAs(actor: UsesAbilities): Promise<void> {
        return BrowseTheWeb.as(actor).resizeBrowserWindow({
            width: this.width,
            height: this.height,
        });
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return `#actor sets the size of the browser window to ${this.width} x ${this.height}`;
    }
}
