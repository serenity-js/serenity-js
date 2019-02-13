import * as ErrorStackParser from 'error-stack-parser';
import { RuntimeError } from '../../../../errors';

/** @access package */
export class ErrorRenderer {
    render(error: Error) {
        // todo: add diff for AssertionError
        return {
            ...this.renderError(error),
            ...((error instanceof RuntimeError && error.cause) ? { rootCause: this.renderError(error.cause) } : {}),
        };
    }

    private renderError(error: Error) {
        return {
            errorType:    error.constructor.name,
            message:      error.message,
            stackTrace:   ErrorStackParser.parse(error).map(frame => ({
                declaringClass: '',
                methodName:     `${ frame.functionName }(${ (frame.args || []).join(', ') })`,
                fileName:       frame.fileName,
                lineNumber:     frame.lineNumber,
            })),
        };
    }
}
