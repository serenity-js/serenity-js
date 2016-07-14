import { Action, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { step } from '../../recording/step_annotation';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Open implements Action {

    static browserOn(website: string): Open {
        return new Open(website);
    }

    @step('{0} opens the #targetWebsite')
    performAs(actor: PerformsTasks & UsesAbilities): Promise<void> {
        return BrowseTheWeb.as(actor).get(this.targetWebsite);
    }

    constructor(private targetWebsite: string) { }
}
