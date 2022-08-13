import { Actor, Interaction } from '@serenity-js/core';

import { InteractDirectly } from '../abilities';

export const RequestANewCalculation = () =>
    Interaction.where(`#actor requests a new calculation`,
        (actor: Actor) => {
            InteractDirectly.as(actor).requestANewCalculationId();
        });
