import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Switch {
    static toParentWindow = (): Interaction => new SwitchToParentWindow();

    static toWindowNumber = (index: number): Interaction => new SwitchToWindow((handles: string[]) => {
        if (! handles[index]) {
            throw new Error(`Can't switch to window ${index} as there are only ${handles.length}`);
        }

        return handles[index];
    })

    static toPopupWindow  = (): Interaction => new SwitchToWindow((handles: string[]) => {
        if (handles.length === 1) {
            throw new Error('No popup window was opened');
        }

        return handles[handles.length - 1];
    })
}

class SwitchToParentWindow implements Interaction {
    performAs = (actor: UsesAbilities) => BrowseTheWeb.as(actor).switchToParentWindow();
}

class SwitchToWindow implements Interaction {
    constructor(private handle: (handles: string[]) => string) {
    }

    performAs = (actor: UsesAbilities) => BrowseTheWeb.as(actor).switchToWindow(this.handle);
}
