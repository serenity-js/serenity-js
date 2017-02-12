import { ActivityType, step } from '../../../serenity/recording';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Clear implements Interaction {

    static theValueOf = (field: Target): Interaction => new Clear(field);

    @step('{0} clears #target', ActivityType.Interaction)
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).clear();
    }

    constructor(private target: Target) {
    }
}
