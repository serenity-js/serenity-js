import { step } from '../../../serenity/recording/step_annotation';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Click implements Interaction {

    public static on(target: Target): Click {
        return new Click(target);
    }

    @step('{0} clicks on #target')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).click();
    }

    constructor(private target: Target) { }
}
