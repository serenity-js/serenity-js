import { Action, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { step } from '../../recording/step_annotation';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Click implements Action {

    public static on(target: Target): Click {
        return new Click(target);
    }

    @step('{0} clicks on #target')
    performAs(actor: PerformsTasks & UsesAbilities): Promise<void> {
        return BrowseTheWeb.as(actor).locate(this.target).click();
    }

    constructor(private target: Target) { }
}
