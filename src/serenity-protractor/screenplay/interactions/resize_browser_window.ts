import { step } from '../../../serenity/recording/step_annotation';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
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
    @step('{0} maximises the browser window')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().maximize();
    }
}

class SetBrowserWindowSize implements Interaction {
    constructor(private width: number, private height: number) {
    }

    @step('{0} sets the size of the browser window to #width x #height')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).manage().window().setSize(this.width, this.height);
    }
}
