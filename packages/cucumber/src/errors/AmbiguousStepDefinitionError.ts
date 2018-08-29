import { RuntimeError } from '@serenity-js/core/lib/errors';

export class AmbiguousStepDefinitionError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(AmbiguousStepDefinitionError, message, cause);
    }
}
