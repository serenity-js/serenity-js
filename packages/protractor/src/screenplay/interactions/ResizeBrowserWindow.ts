import { Interaction, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

export class ResizeBrowserWindow {
    static toMaximum = (): Interaction => new MaximiseBrowserWindow();
    static to = (width: number, height: number): Interaction => new SetBrowserWindowSize(width, height);
}

class MaximiseBrowserWindow implements Interaction {

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
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
    toString() {
        return `#actor maximises the browser window`;
    }
}

class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
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
    toString() {
        return `#actor sets the size of the browser window to ${this.width} x ${this.height}`;
    }
}
