import { inspect } from 'util';
import { Answerable } from '../screenplay/Answerable';
import { Question } from '../screenplay/Question';

/**
 * @desc
 *  Provides a human-readable description of the {@link Answerable<T>}.
 *  Similar to {@link util~inspect}.
 *
 * @public
 * @param {Answerable<any>} value
 * @return {string}
 */
export function inspected(value: Answerable<any>): string {
    if (! isDefined(value)) {
        return inspect(value);
    }

    if (Array.isArray(value)) {
        return [
            '[',
            value.map(item => `  ${ inspected(item) }`).join(',\n'),
            ']',
        ].join('\n');
    }

    if (isAPromise(value)) {
        return `a Promise`;
    }

    if (Question.isAQuestion(value)) {
        return value.toString();
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

    if (isANamedFunction(value)) {
        return `${ value.name } property`;
    }

    return inspect(value, { breakLength: Infinity, compact: true, sorted: false  });
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
    return !! (v as any).then;
}

/**
 * @desc
 * Checks if the value is a named {@link Function}
 *
 * @private
 * @param {Answerable<any>} v
 */
function isANamedFunction<T>(v: any): v is { name: string } {
    return {}.toString.call(v) === '[object Function]' && (v as any).name !== '';
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
