import { EnterOperandCommand, Operand } from '@serenity-js-examples/calculator-app';
import { Actor, Interaction } from '@serenity-js/core';
import { InteractDirectly } from '../abilities';

export const EnterOperand = (operand: Operand) => Interaction.where(`#actor enters an operand of ${operand.value}`, (actor: Actor) => {
    const ability = InteractDirectly.as(actor);

    return ability.execute(
        new EnterOperandCommand(
            operand,
            ability.currentCalculationId(),
        ),
    );
});
