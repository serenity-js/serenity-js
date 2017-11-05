import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';

export class ResizeBrowserWindow {
    static toMaximum = (): Interaction => new MaximiseBrowserWindow();
    static to = (width: number, height: number): Interaction => new SetBrowserWindowSize(width, height);
}

class MaximiseBrowserWindow implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().maximize();
    }

    toString = () => `#actor maximises the browser window`;
}

class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {
    }

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().setSize(this.width, this.height);
    }

    toString = () => `#actor sets the size of the browser window to ${this.width} x ${this.height}`;
}
