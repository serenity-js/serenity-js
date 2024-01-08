/* eslint-disable @typescript-eslint/ban-types */
import { ErrorStackParser, RuntimeError } from '@serenity-js/core';
import ansiRegex from 'ansi-regex';
import { inspect } from 'util';

import type { ErrorDetailsSchema } from '../../serenity-bdd-report-schema';

/** @package */
export function errorReportFrom(error?: Error | string | number | boolean | object): ErrorDetailsSchema {
    return {
        ...errorDetailsOf(error),
        ...(error instanceof RuntimeError && (error as RuntimeError).cause)
            ? { rootCause: errorReportFrom((error as RuntimeError).cause) }
            : { },
    };
}

/** @package */
function errorDetailsOf(maybeError: Error | string | number | boolean | object): ErrorDetailsSchema {
    return {
        errorType:  errorTypeOf(maybeError),
        message:    errorMessageOf(maybeError).replace(ansiRegex(), ''),
        stackTrace: errorStackOf(maybeError),
    }
}

/** @package */
function errorTypeOf(maybeError: Error | string | number | boolean | object): string {
    if (! isDefined(maybeError)) {
        return `${ maybeError }`;
    }

    return maybeError.constructor.name;
}

/** @package */
function errorMessageOf(maybeError: any): string {
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
            methodName:     frame.functionName ? `${ frame.functionName }(${ (frame.args || []).join(', ') })` : '',
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
