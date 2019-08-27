import { Interaction } from '@serenity-js/core';
import { ExecutionError } from '../../model';

/**
 * @package
 */
export const TerminateFlow = {
    because: (message: string, cause?: Error) => Interaction.where(`#actor terminates the flow because "${ message }"`, actor => {
        throw new ExecutionError(message, cause);
    }),
};
