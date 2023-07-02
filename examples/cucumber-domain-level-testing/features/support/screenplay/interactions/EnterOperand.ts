import { EnterOperandCommand, Operand } from '@examples/calculator-app';
import { Actor, Interaction } from '@serenity-js/core';
import { JSONData } from '@serenity-js/core/lib/model';

import { InteractDirectly } from '../abilities';

export const EnterOperand = (operand: Operand) =>
    Interaction.where(`#actor enters an operand of ${ operand.value }`,
        (actor: Actor) => {
            const ability = InteractDirectly.as(actor);

            const command = new EnterOperandCommand(
                operand,
                ability.currentCalculationId(),
            );

            ability.execute(
                command,
            );

            actor.collect(JSONData.fromJSON(command.toJSON()), command.constructor.name);
        }
    );
