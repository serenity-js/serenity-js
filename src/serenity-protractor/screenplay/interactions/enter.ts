import { Interaction, PerformsTasks, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';
import { Hit } from './hit';

export class Enter implements Interaction {

    private target: Target;
    private interactions: Interaction[] = [];

    static theValue(value: string): Enter {
        return new Enter(value);
    }

    into(field: Target): Enter {
        this.target = field;
        this.interactions.push(new EnterValue(this.value, field));

        return this;
    }

    thenHit(key: string) {
        this.interactions.push(Hit.the(key).into(this.target));

        return this;
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return actor.attemptsTo(
            ...this.interactions
        );
    }

    constructor(private value: string) { }
}

class EnterValue implements Interaction {
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.value);
    }

    constructor(private value: string, private target: Target) { }
}
