import { RuntimeError } from '@serenity-js/core';
import { ErrorStackParser } from '@serenity-js/core/lib/io';
import { ErrorDetails } from '../../SerenityBDDJsonSchema';

/**
 * @package
 */
export function errorReportFrom(error: Error): ErrorDetails {
    return {
        ...errorDetailsOf(error),
        ...(error instanceof RuntimeError && error.cause)
            ? { rootCause: errorReportFrom(error.cause) }
            : { },
    };
}

/**
 * @package
 */
function errorDetailsOf(error: Error): ErrorDetails {
    const parser = new ErrorStackParser();

    return {
        errorType:    error.constructor.name,
        message:      error.message,
        stackTrace:   ! error.stack ? [] : parser.parse(error).map(frame => ({
            declaringClass: '',
            methodName:     `${ frame.functionName }(${ (frame.args || []).join(', ') })`,
            fileName:       frame.fileName,
            lineNumber:     frame.lineNumber,
        })),
    }
}
