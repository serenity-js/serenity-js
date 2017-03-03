import { ActivityType, step } from '../../../serenity/recording';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Click implements Interaction {

    public static on(target: Target): Click {
        return new Click(target);
    }

    @step('{0} clicks on #target', ActivityType.Interaction)
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).click();
    }

    constructor(private target: Target) { }
}
