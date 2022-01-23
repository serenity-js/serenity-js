import { inspect } from 'util';

import { Answerable } from '../screenplay/Answerable';
import { Question } from '../screenplay/Question';

interface InspectedConfig {
    inline: boolean;
    markQuestions?: boolean;
}

/**
 * @desc
 *  Provides a human-readable description of the {@link Answerable<T>}.
 *  Similar to {@link util~inspect}.
 *
 * @public
 * @param {Answerable<any>} value
 * @param config
 *  - inline - Return a single-line string instead of the default potentially multi-line description
 *  - markQuestions - Surround the description of async values, such as Promises and Questions with <<value>>
 * @return {string}
 */
export function inspected(value: Answerable<any>, config?: InspectedConfig): string {

    const { inline, markQuestions } = { inline: false, markQuestions: false, ...config };

    if (! isDefined(value)) {
        return inspect(value);
    }

    if (Array.isArray(value)) {
        return stringifiedArray(value, inline);
    }

    if (isAPromise(value)) {
        return markAs('Promise', true);
    }

    if (Question.isAQuestion(value)) {
        return markAs(value.toString(), markQuestions);
    }

    if (isADate(value)) {
        return value.toISOString();
    }

    if (hasItsOwnToString(value)) {
        return value.toString();
    }

    if (isInspectable(value)) {
        return value.inspect();
    }

    if (isAFunction(value)) {
        return hasName(value)
            ? value.name
            : markAs(`Function`, true);
    }

    if (! hasCustomInspectionFunction(value) && isPlainObject(value) && isSerialisableAsJSON(value)) {
        return stringifiedToJson(value, inline);
    }

    return inspect(value, { breakLength: Number.POSITIVE_INFINITY, compact: inline ? 3 : false, sorted: false  });
}

function stringifiedToJson(value: any, inline: boolean): string {
    const indentation = inline ? 0 : 4;

    return JSON.stringify(value, undefined, indentation);
}

function stringifiedArray(value: any[], inline: boolean): string {
    const indentation   = inline ? '' : '  ';
    const separator     = inline ? ' ' : '\n';

    const inspectedItem = (item: unknown, index: number) =>
        [
            indentation,
            inspected(item, { inline, markQuestions: true }),
            index < value.length - 1 ? ',' : ''
        ].join('')

    return [
        '[',
        ...value.map(inspectedItem),
        ']',
    ].join(separator);
}

function markAs(value: string, markValue: boolean): string {
    const [left, right] = markValue && ! value.startsWith('<<')
        ? [ '<<', '>>' ]
        : ['', ''];

    return [ left, value, right ].join('');
}

/**
 * @desc
 * Checks if the value is defined
 *
 * @private
 * @param {Answerable<any>} v
 */
function isDefined(v: Answerable<any>) {
    return !! v;
}

/**
 * @desc
 * Checks if the value defines its own `toString` method
 *
 * @private
 * @param {Answerable<any>} v
 */
function hasItsOwnToString(v: Answerable<any>): v is { toString: () => string } {
    return typeof v === 'object'
        && !! (v as any).toString
        && typeof (v as any).toString === 'function'
        && ! isNative((v as any).toString);
}

/**
 * @desc
 * Checks if the value defines its own `inspect` method
 *
 * @private
 * @param {Answerable<any>} v
 */
function isInspectable(v: Answerable<any>): v is { inspect: () => string } {
    return !! (v as any).inspect && typeof (v as any).inspect === 'function';
}

/**
 * @desc
 * Checks if the value is a {@link Date}
 *
 * @private
 * @param {Answerable<any>} v
 */
function isADate(v: Answerable<any>): v is Date {
    return v instanceof Date;
}

/**
 * @desc
 * Checks if the value is a {@link Promise}
 *
 * @private
 * @param {Answerable<any>} v
 */
function isAPromise<T>(v: Answerable<T>): v is Promise<T> {
    return typeof v === 'object'
        && 'then' in v;
}

/**
 * @desc
 * Checks if the value is a named {@link Function}
 *
 * @private
 * @param {Answerable<any>} v
 */
function isAFunction(v: any): v is Function {       // eslint-disable-line @typescript-eslint/ban-types
    return Object.prototype.toString.call(v) === '[object Function]';
}

/**
 * @desc
 *  Checks if the value is has a property called 'name' with a non-empty value.
 *
 * @private
 * @param {Answerable<any>} v
 */
function hasName(v: any): v is { name: string } {
    return typeof (v as any).name === 'string' && (v as any).name !== '';
}

/**
 * @desc
 * Checks if the value defines its own `inspect` method
 * See: https://nodejs.org/api/util.html#util_util_inspect_custom
 *
 * @private
 * @param {Answerable<any>} v
 */
function hasCustomInspectionFunction(v: Answerable<any>): v is object { // eslint-disable-line @typescript-eslint/ban-types
    return v && v[Symbol.for('nodejs.util.inspect.custom')];
}

/**
 * @desc
 * Checks if the value has a good chance of being a plain JavaScript object
 *
 * @private
 * @param {Answerable<any>} v
 */
function isPlainObject(v: Answerable<any>): v is object {   // eslint-disable-line @typescript-eslint/ban-types

    // Basic check for Type object that's not null
    if (typeof v === 'object' && v !== null) {

        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf === 'function') {
            const proto = Object.getPrototypeOf(v);
            return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(v) === '[object Object]';
    }

    // Not an object
    return false;
}

/**
 * @desc
 * Checks if the value is a JSON object that can be stringified
 *
 * @private
 * @param {Answerable<any>} v
 */
function isSerialisableAsJSON(v: any): v is object {    // eslint-disable-line @typescript-eslint/ban-types
    try {
        JSON.stringify(v);

        return true;
    } catch {
        return false;
    }
}

/**
 * https://davidwalsh.name/detect-native-function
 * @param {any} v
 */
function isNative(v: any): v is Function {  // eslint-disable-line @typescript-eslint/ban-types

    const
        toString        = Object.prototype.toString,    // Used to resolve the internal `[[Class]]` of values
        fnToString      = Function.prototype.toString,  // Used to resolve the decompiled source of functions
        hostConstructor = /^\[object .+?Constructor]$/; // Used to detect host constructors (Safari > 4; really typed array specific)

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    const nativeFunctionTemplate = new RegExp(
        '^' +
        // Coerce `Object#toString` to a string
        String(toString)
        // Escape any special regexp characters
            .replace(/[$()*+./?[\\\]^{|}]/g , '\\$&')
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\])/g, '$1.*?') +
        '$',
    );

    const type = typeof v;
    return type === 'function'
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        ? nativeFunctionTemplate.test(fnToString.call(v))
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        : (v && type === 'object' && hostConstructor.test(toString.call(v))) || false;
}
