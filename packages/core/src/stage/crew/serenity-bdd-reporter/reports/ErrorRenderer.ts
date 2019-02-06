import * as ErrorStackParser from 'error-stack-parser';

/** @access package */
export class ErrorRenderer {
    render(error: Error) {
        // todo: add diff for AssertionError
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
