import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { step } from '../../recording/step_annotation';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Open implements Interaction {

    static browserOn(website: string): Open {
        return new Open(website);
    }

    @step('{0} opens the #targetWebsite')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).get(this.targetWebsite);
    }

    constructor(private targetWebsite: string) { }
}
