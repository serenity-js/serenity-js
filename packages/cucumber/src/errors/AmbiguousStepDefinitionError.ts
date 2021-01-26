import { RuntimeError } from '@serenity-js/core/lib/errors';

/**
 * @desc
 *  Thrown when more than one Cucumber step definition matches
 *  a Cucumber step.
 *
 * @extends {@serenity-js/core/lib/errors~RuntimeError}
 */
export class AmbiguousStepDefinitionError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(AmbiguousStepDefinitionError, message, cause);
    }
}
