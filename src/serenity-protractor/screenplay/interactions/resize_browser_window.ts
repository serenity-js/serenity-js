import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class ResizeBrowserWindow {
    static toMaximum(): Interaction {
        return new MaximiseBrowserWindow();
    }

    static to(width: number, height: number): Interaction {
        return new SetBrowserWindowSize(width, height);
    }
}

class MaximiseBrowserWindow implements Interaction {
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().maximize();
    }
}

class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().setSize(this.width, this.height);
    }
}
