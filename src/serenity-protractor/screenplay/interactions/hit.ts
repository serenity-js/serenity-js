import { ActivityType, step } from '../../../serenity/recording';
import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { keyNameOf } from '../../keys';
import { BrowseTheWeb } from '../abilities';
import { Target } from '../ui/target';

export class Hit {
    static the = (key: string) => ({
        into: (target: Target): Interaction => new HitKeyIntoTarget(target, key),
    })
}

class HitKeyIntoTarget implements Interaction {

    @step('Hits the #keyname key', ActivityType.Interaction)
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.key);
    }

    constructor(private target: Target, private key: string) {}

    private keyname = () => keyNameOf(this.key);                               // tslint:disable-line:no-unused-variable
}
