import { ActivityType, step } from '../../../serenity/recording';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class DoubleClick implements Interaction {

    static on = (target: Target): DoubleClick => new DoubleClick(target);

    @step('{0} double-clicks on #target', ActivityType.Interaction)
    performAs(actor: UsesAbilities): PromiseLike<void> {
        const
            browse  = BrowseTheWeb.as(actor),
            el: any = browse.locate(this.target);

        return browse.actions().doubleClick(el).perform();
    }

    constructor(private target: Target) { }
}
