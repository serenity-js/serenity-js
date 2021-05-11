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

        // todo: de-serialise the cause map well
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
        const lines = stack.split('\n');

        const pattern = /^([^\s:]*Error):\s(.*)$/;
        if (! pattern.test(lines[0])) {
            return new Error(stack);
        }

        const [, name, message ] = lines[0].match(pattern);

        return ErrorSerialiser.deserialise(stringify({ name, message, stack }));
    }
}
