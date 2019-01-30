import { inspect } from 'util';
import { KnowableUnknown, Question } from '../screenplay';

/**
 * @desc
 * A tag function returning a human-readable description of a template containing one or more {KnowableUnknown}s.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @param {TemplateStringsArray} templates
 * @param {Array<KnowableUnknown<any>>} placeholders
 */
export function formatted(templates: TemplateStringsArray, ...placeholders: Array<KnowableUnknown<any>>) {
    return templates
        .map((template, i) => i < placeholders.length
            ? [ template, descriptionOf(placeholders[i]) ]
            : [ template ])
        .reduce((acc, tuple) => acc.concat(tuple))
        .join('');
}

/**
 * @desc
 * Provides a human-readable and sync description of the {@link KnowableUnknown<T>}
 *
 * @package
 * @param value
 */
function descriptionOf(value: KnowableUnknown<any>): string {
    if (! isDefined(value)) {
        return inspect(value);
    }

    if (isAPromise(value)) {
        return `a promised value`;
    }

    if (isAQuestion(value)) {
        return value.toString();
    }

    if (isADate(value)) {
        return value.toISOString();
    }

    if (isInspectable(value)) {
        return value.inspect();
    }

    if (hasItsOwnToString(value)) {
        return value.toString();
    }

    return inspect(value);
}

/**
 * @desc
 * Checks if the value is defined
 *
 * @private
 * @param {KnowableUnknown<any>} v
 */
function isDefined(v: KnowableUnknown<any>) {
    return !! v;
}

/**
 * @desc
 * Checks if the value defines its own `toString` method
 *
 * @private
 * @param {KnowableUnknown<any>} v
 */
function hasItsOwnToString(v: KnowableUnknown<any>): v is { toString: () => string } {
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
 * @param {KnowableUnknown<any>} v
 */
function isInspectable(v: KnowableUnknown<any>): v is { inspect: () => string } {
    return !! (v as any).inspect && typeof (v as any).inspect === 'function';
}

/**
 * @desc
 * Checks if the value is a {@link Question}
 *
 * @private
 * @param {KnowableUnknown<any>} v
 */
function isAQuestion<T>(v: KnowableUnknown<T>): v is Question<T> {
    return !! (v as any).answeredBy;
}

/**
 * @desc
 * Checks if the value is a {@link Date}
 *
 * @private
 * @param {KnowableUnknown<any>} v
 */
function isADate(v: KnowableUnknown<any>): v is Date {
    return v instanceof Date;
}

/**
 * @desc
 * Checks if the value is a {@link Promise}
 *
 * @private
 * @param {KnowableUnknown<any>} v
 */
function isAPromise<T>(v: KnowableUnknown<T>): v is Promise<T> {
    return !! (v as any).then;
}

/**
 * https://davidwalsh.name/detect-native-function
 * @param {any} v
 */
function isNative(v: any): v is Function {      // tslint:disable-line:ban-types

    const
        toString        = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of values
        fnToString      = Function.prototype.toString,   // Used to resolve the decompiled source of functions
        hostConstructor = /^\[object .+?Constructor\]$/; // Used to detect host constructors (Safari > 4; really typed array specific)

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    const nativeFnTemplate = RegExp(
        '^' +
        // Coerce `Object#toString` to a string
        String(toString)
        // Escape any special regexp characters
            .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
        '$',
    );

    const type = typeof v;
    return type === 'function'
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        ? nativeFnTemplate.test(fnToString.call(v))
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        : (v && type === 'object' && hostConstructor.test(toString.call(v))) || false;
}
