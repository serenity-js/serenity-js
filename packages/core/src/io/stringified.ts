import { inspect } from 'util';

import { Answerable } from '../screenplay/Answerable';
import { Question } from '../screenplay/Question';

const indentationPrefix = '  ';

interface StringifyConfig {
    inline: boolean;
    indentationLevel?: number;
    markQuestions?: boolean;
}

/**
 * Provides a human-readable description of the {@apilink Answerable<T>}.
 * Similar to [Node util~inspect](https://nodejs.org/api/util.html#utilinspectobject-options).
 *
 * @param value
 * @param config
 *  - inline - Return a single-line string instead of the default potentially multi-line description
 *  - markQuestions - Surround the description of async values, such as Promises and Questions with <<value>>
 */
export function stringified(value: Answerable<any>, config?: StringifyConfig): string {

    const { indentationLevel, inline, markQuestions } = { indentationLevel: 0, inline: false, markQuestions: false, ...config };

    if (! isDefined(value)) {
        return inspect(value);
    }

    if (Array.isArray(value)) {
        return stringifiedArray(value, { indentationLevel, inline, markQuestions });
    }

    if (isAPromise(value)) {
        return markAs('Promise', markQuestions);
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
        return stringifiedToJson(value, { indentationLevel, inline, markQuestions });
    }

    return inspect(value, { breakLength: Number.POSITIVE_INFINITY, compact: inline ? 3 : false, sorted: false  });
}

function indented(line: string, config: { inline: boolean; indentationLevel?: number }): string {
    const indentation = config.inline
        ? ''
        : indentationPrefix.repeat(config.indentationLevel || 0);

    return indentation + line;
}

function stringifiedToJson(value: any, config: StringifyConfig): string {
    const jsonLineIndentation = config.inline ? 0 : indentationPrefix.length;

    const [ first, ...rest ] = JSON.stringify(value, undefined, jsonLineIndentation).split('\n');

    return [
        first,
        ...rest.map(line => indented(line, config))
    ].join('\n');
}

function stringifiedArray(value: any[], config: StringifyConfig): string {
    const lineSeparator = config.inline ? ' ' : '\n';

    const inspectedItem = (item: unknown, index: number) => {
        const nestedItemConfig = { ...config, indentationLevel: config.indentationLevel + 1 }
        return [
            indented('', nestedItemConfig),
            stringified(item, nestedItemConfig),
            index < value.length - 1 ? ',' : ''
        ].join('')
    }

    return [
        `[`,
        ...value.map(inspectedItem),
        indented(']', config),
    ].join(lineSeparator);
}

function markAs(value: string, markValue: boolean): string {
    const [ left, right ] = markValue && ! value.startsWith('<<')
        ? [ '<<', '>>' ]
        : [ '', '' ];

    return [ left, value, right ].join('');
}

/**
 * Checks if the value is defined
 *
 * @param v
 */
function isDefined(v: Answerable<any>) {
    return !! v;
}

/**
 * Checks if the value defines its own `toString` method
 *
 * @param v
 */
function hasItsOwnToString(v: Answerable<any>): v is { toString: () => string } {
    return typeof v === 'object'
        && !! (v as any).toString
        && typeof (v as any).toString === 'function'
        && ! isNative((v as any).toString);
}

/**
 * Checks if the value defines its own `inspect` method
 *
 * @param v
 */
function isInspectable(v: Answerable<any>): v is { inspect: () => string } {
    return !! (v as any).inspect && typeof (v as any).inspect === 'function';
}

/**
 * Checks if the value is a {@apilink Date}
 *
 * @param v
 */
function isADate(v: Answerable<any>): v is Date {
    return v instanceof Date;
}

/**
 * Checks if the value is a {@apilink Promise}
 *
 * @param v
 */
function isAPromise<T>(v: Answerable<T>): v is Promise<T> {
    return typeof v === 'object'
        && 'then' in v;
}

/**
 * Checks if the value is a named {@apilink Function}
 *
 * @param v
 */
function isAFunction(v: any): v is Function {       // eslint-disable-line @typescript-eslint/ban-types
    return Object.prototype.toString.call(v) === '[object Function]';
}

/**
 * Checks if the value is has a property called 'name' with a non-empty value.
 *
 * @param v
 */
function hasName(v: any): v is { name: string } {
    return typeof (v as any).name === 'string' && (v as any).name !== '';
}

/**
 * Checks if the value defines its own [`inspect` method](https://nodejs.org/api/util.html#util_util_inspect_custom)
 *
 * @param v
 */
function hasCustomInspectionFunction(v: Answerable<any>): v is object { // eslint-disable-line @typescript-eslint/ban-types
    return v && v[Symbol.for('nodejs.util.inspect.custom')];
}

/**
 * Checks if the value has a good chance of being a plain JavaScript object
 *
 * @param v
 */
export function isPlainObject(v: unknown): v is object {   // eslint-disable-line @typescript-eslint/ban-types

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
 * Checks if the value is a JSON object that can be stringified
 *
 * @param v
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
 * Inspired by https://davidwalsh.name/detect-native-function
 *
 * @param v
 */
function isNative(v: any): v is Function {  // eslint-disable-line @typescript-eslint/ban-types

    const
        toString        = Object.prototype.toString,    // Used to resolve the internal `{@apilink Class}` of values
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
