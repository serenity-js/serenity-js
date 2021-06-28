import { JSONObject } from 'tiny-types';

import * as serenitySpecificErrors from '../errors';
import { parse, stringify } from './json';

/**
 *
 * @extends {tiny-types~JSONObject}
 * @public
 */
export interface SerialisedError extends JSONObject {
    /**
     *  Name of the constructor function used to instantiate
     *  the original {@link Error} object.
     */
    name:    string;

    /**
     *  Message of the original {@link Error} object
     */
    message: string;

    /**
     *  Stack trace of the original {@link Error} object
     */
    stack:   string;
}

export class ErrorSerialiser {
    private static recognisedErrors = [
        ...Object.keys(serenitySpecificErrors).map(key => serenitySpecificErrors[key]),
        Error,
        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,
    ];

    static serialise(error: Error): string {
        const serialisedError = Object.getOwnPropertyNames(error).reduce((serialised, key) => {
            serialised[key] = error[key]
            return serialised;
        }, { name: error.constructor.name || error.name }) as SerialisedError;

        return stringify(serialisedError);
    }

    static deserialise<E extends Error>(stringifiedError: string): E {
        const serialisedError = parse(stringifiedError) as SerialisedError;

        const constructor = ErrorSerialiser.recognisedErrors.find(errorType => errorType.name === serialisedError.name) || Error;
        const deserialised = Object.create(constructor.prototype);
        for (const property in serialisedError) {
            if (Object.prototype.hasOwnProperty.call(serialisedError, property)) {
                deserialised[property] = serialisedError[property];
            }
        }
        return deserialised;
    }

    static deserialiseFromStackTrace(stack: string): Error {
        const stackTracePattern = /^([^\s:]*Error).*?(?::\s)?(.*?)\n(^ +at.*)$/ms;

        if (! stackTracePattern.test(stack)) {
            return new Error(String(stack));
        }

        const [, name, message, callStack_ ] = stack.match(stackTracePattern);

        return ErrorSerialiser.deserialise(stringify({ name, message: message.trim(), stack }));
    }
}
