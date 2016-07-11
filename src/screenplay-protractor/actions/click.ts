import {step} from '../../screenplay/recording/annotations';
import { PerformsTasks, UsesAbilities } from '../../serenity/screenplay/actor';
import {Action} from '../../serenity/screenplay/performables';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Click implements Action {

    public static on(target: Target): Click {
        return new Click(target);
    }

    @step('{0} clicks on #target')
    performAs(actor: PerformsTasks & UsesAbilities) {
        BrowseTheWeb.as(actor).locate(this.target).click();
    }

    constructor(private target: Target) { }
}
