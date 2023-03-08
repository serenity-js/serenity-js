import { Operator, UseOperatorCommand } from '@examples/calculator-app';
import { Actor, Interaction } from '@serenity-js/core';
import { JSONData } from '@serenity-js/core/lib/model';

import { InteractDirectly } from '../abilities';

export const UseOperator = (operator: Operator) => Interaction.where(`#actor uses the ${ operator.constructor.name }`,
    (actor: Actor) => {
        const ability = InteractDirectly.as(actor);

        const command = new UseOperatorCommand(
            operator,
            ability.currentCalculationId(),
        );

        ability.execute(
            command,
        );

        actor.collect(JSONData.fromJSON(command.toJSON()), command.constructor.name);
    });
