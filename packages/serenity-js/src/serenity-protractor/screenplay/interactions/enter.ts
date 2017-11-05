import { Interaction, PerformsTasks, Task, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';
import { Hit } from './hit';

export class Enter implements Task {

    private target: Target;
    private interactions: Interaction[] = [];

    static theValue(value: string | number): Enter {
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
            ...this.interactions,
        );
    }

    constructor(private value: string | number) { }
}

class EnterValue implements Interaction {

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.value as string);
    }

    constructor(private value: string | number, private target: Target) { }

    toString = () => `#actor enters ${this.value} into ${this.target}`;
}
