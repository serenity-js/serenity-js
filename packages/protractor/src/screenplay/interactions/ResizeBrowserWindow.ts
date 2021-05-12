import { Interaction, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  resize the browser window.
 *
 *  **Please note** that another way to set the size of the browser window
 *  is to configure it in [`protractor.conf.js`](https://github.com/angular/protractor/blob/master/lib/config.ts).
 *
 * @see {@link Window}
 */
export class ResizeBrowserWindow {

    /**
     * @desc
     *  Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  setting the size of the browser window to maximum.
     *
     * @example <caption>Maximising browser window</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Navigate, ResizeBrowserWindow, Window } from '@serenity-js/protractor';
     *  import { Ensure, isGreaterThan } from '@serenity-js/assertions';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Ventana')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Navigate.to('/app'),
     *          ResizeBrowserWindow.toMaximum(),
     *          Ensure.that(Window.size(), property('width', isGreaterThan(1024))),
     *      );
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link BrowseTheWeb}
     * @see {@link Window.size}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~property}
     * @see {@link @serenity-js/assertions/lib/expectations~isGreaterThan}
     */
    static toMaximum(): Interaction {
        return new MaximiseBrowserWindow();
    }

    /**
     * @desc
     *  Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  setting the size of the browser window to given `width` and `height`
     *
     * @example <caption>Setting specific window size</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Navigate, ResizeBrowserWindow } from '@serenity-js/protractor';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Ventana')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Navigate.to('/app'),
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
class MaximiseBrowserWindow implements Interaction {

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
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().maximize();
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor maximises the browser window`;
    }
}

/**
 * @package
 */
class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {
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
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().setSize(this.width, this.height);
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
