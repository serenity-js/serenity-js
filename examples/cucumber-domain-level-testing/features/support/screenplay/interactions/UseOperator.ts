import { Operator, UseOperatorCommand } from '@serenity-js-examples/calculator-app';
import { Actor, Interaction } from '@serenity-js/core';
import { InteractDirectly } from '../abilities';

export const UseOperator = (operator: Operator) => Interaction.where(`#actor uses the ${ operator.constructor.name }`, (actor: Actor) => {
    const ability = InteractDirectly.as(actor);

    return ability.execute(
        new UseOperatorCommand(
            operator,
            ability.currentCalculationId(),
        ),
    );
});
