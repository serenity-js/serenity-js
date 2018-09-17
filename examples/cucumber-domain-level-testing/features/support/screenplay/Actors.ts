import { Calculator } from '@serenity-js-examples/calculator-app';
import { Actor } from '@serenity-js/core';
import { Cast } from '@serenity-js/core/lib/stage';

import { InteractDirectly } from './abilities';

export class Actors implements Cast {
    actor(name: string) {
        return Actor.named(name).whoCan(InteractDirectly.with(new Calculator()));
    }
}
