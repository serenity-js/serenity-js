import { Actor, Cast } from '@serenity-js/core';
import { Calculator } from '@serenity-js-examples/calculator-app';

import { InteractDirectly } from './abilities';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(InteractDirectly.with(new Calculator()));
    }
}
