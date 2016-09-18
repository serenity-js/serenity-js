import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

import { by } from 'protractor/globals';

export class Select {
    static theValue(value: string) {
        return new Select(value);
    }

    from(target: Target): Interaction {
        return new SelectOption(this.value, target);
    }

    constructor(private value: string) {
    }
}

class SelectOption implements Interaction {
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).element(by.cssContainingText('option', this.value)).click();
    }

    constructor(private value: string, private target: Target) {
    }
}
