import { step } from '../../../serenity/recording/step_annotation';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Open implements Interaction {

    static browserOn(website: string): Open {
        return new Open(website);
    }

    @step('{0} opens the browser at "#targetWebsite"')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).get(this.targetWebsite);
    }

    constructor(private targetWebsite: string) { }
}
