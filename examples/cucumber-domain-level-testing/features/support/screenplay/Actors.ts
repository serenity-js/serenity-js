import { Calculator } from '@serenity-js-examples/calculator-app';
import { Actor, DressingRoom } from '@serenity-js/core';

import { InteractDirectly } from './abilities';

export class Actors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor.whoCan(InteractDirectly.with(new Calculator()));
    }
}
