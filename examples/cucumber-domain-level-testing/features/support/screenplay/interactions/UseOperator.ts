import { EnterOperandCommand, Operand, Operator, UseOperatorCommand } from '@serenity-js-examples/calculator-app';
import { Actor, EmitArtifact, Interaction } from '@serenity-js/core';
import { JSONData } from '@serenity-js/core/lib/model';
import { InteractDirectly } from '../abilities';

export const UseOperator = (operator: Operator) => Interaction.where(`#actor uses the ${ operator.constructor.name }`,
    (actor: Actor, emitArtifact: EmitArtifact) => {
        const ability = InteractDirectly.as(actor);

        const command = new UseOperatorCommand(
            operator,
            ability.currentCalculationId(),
        );

        ability.execute(
            command,
        );

        emitArtifact(JSONData.fromJSON(command.toJSON()), command.constructor.name);
    });
