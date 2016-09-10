import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { keyNameOf } from '../../keys';
import { BrowseTheWeb } from '../abilities';
import { Target } from '../ui/target';

export class Hit {
    static the(key: string) {
      return new Hit(key);
    }

    public into(target: Target): Interaction {
        return new HitKeyIntoTarget(target, this.key);
    }

    constructor(private key: string) {}
}

class HitKeyIntoTarget implements Interaction {

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.key);
    }

    constructor(private target: Target, private key: string) {}

    private keyname = () => keyNameOf(this.key);                               // tslint:disable-line:no-unused-variable
}
