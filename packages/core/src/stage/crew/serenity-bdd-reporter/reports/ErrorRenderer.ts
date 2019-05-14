import { RuntimeError } from '../../../../errors';
import { ErrorStackParser } from '../../../../io';

/** @access package */
export class ErrorRenderer {
    private static parser = new ErrorStackParser();

    render(error: Error) {
        // tslint:disable-next-line:prefer-object-spread     Esdoc doesn't understand spread
        return Object.assign(
            {},
            this.renderError(error),
            ((error instanceof RuntimeError && error.cause) ? { rootCause: this.renderError(error.cause) } : {}),
        );
    }

    private renderError(error: Error) {
        return {
            errorType:    error.constructor.name,
            message:      error.message,
            stackTrace:   ErrorRenderer.parser.parse(error).map(frame => ({
                declaringClass: '',
                methodName:     `${ frame.functionName }(${ (frame.args || []).join(', ') })`,
                fileName:       frame.fileName,
                lineNumber:     frame.lineNumber,
            })),
        };
    }
}
