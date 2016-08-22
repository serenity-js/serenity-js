import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { step } from '../../recording/step_annotation';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Enter implements Interaction {

    private target: Target;
    private key: string;

    static theValue(value: string): Enter {
        return new Enter(value);
    }

    into(field: Target): Enter {
        this.target = field;

        return this;
    }

    thenHit(key: string) {
        this.key = key;

        return this;
    }

    @step("{0} enters '#value' into #target")
    performAs(actor: PerformsTasks & UsesAbilities): Promise<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.value, this.key);
    }

    constructor(private value: string) { }
}
