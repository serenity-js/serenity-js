import { RuntimeError } from '@serenity-js/core';
import { ErrorStackParser } from '@serenity-js/core/lib/io';
import { inspect } from 'util';
import { ErrorDetails } from '../../SerenityBDDJsonSchema';

/** @package */
export function errorReportFrom(error: any): ErrorDetails {
    return {
        ...errorDetailsOf(error),
        ...(error instanceof RuntimeError && error.cause)
            ? { rootCause: errorReportFrom(error.cause) }
            : { },
    };
}

/** @package */
function errorDetailsOf(maybeError: any): ErrorDetails {
    return {
        errorType:  errorTypeOf(maybeError),
        message:    errorMessageOf(maybeError),
        stackTrace: errorStackOf(maybeError),
    }
}

/** @package */
function errorTypeOf(maybeError: any) {
    if (! isDefined(maybeError)) {
        return `${ maybeError }`;
    }

    return maybeError.constructor.name;
}

/** @package */
function errorMessageOf(maybeError: any) {
    if (! isDefined(maybeError)) {
        return '';
    }

    if (typeof maybeError === 'string') {
        return maybeError;
    }

    if (is(maybeError, Error) && isDefined(maybeError.message)) {
        return maybeError.message;
    }

    return inspect(maybeError);
}

function errorStackOf(maybeError: any) {
    if (isDefined(maybeError) && isDefined(maybeError.stack)) {
        const parser = new ErrorStackParser();

        return parser.parse(maybeError).map(frame => ({
            declaringClass: '',
            methodName:     `${ frame.functionName }(${ (frame.args || []).join(', ') })`,
            fileName:       frame.fileName,
            lineNumber:     frame.lineNumber,
        }))
    }

    return [];
}

/** @package */
function isDefined(maybeError: any) {
    return maybeError !== null
        && maybeError !== undefined;
}

/** @package */
function is<T>(maybeError: any, type: new (...args: any[]) => T): maybeError is T {
    return isDefined(maybeError)
        && maybeError instanceof type;
}
