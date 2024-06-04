import { ensure, isGreaterThanOrEqualTo } from 'tiny-types';
import { significantFieldsOf } from 'tiny-types/lib/objects';

import { isPlainObject } from '../../io/isPlainObject';
import type { Answerable } from '../Answerable';
import type { DescriptionOptions } from './descriptions/DescriptionOptions';
// import { Masked } from './Masked';

/**
 * Interpolating a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates),
 * parameterised with [primitive data types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [complex data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects),
 * or any {@apilink Answerable|Answerables} and produces a single-line, human-readable description. This function is used internally by [`description`](/api/core/function/description/) and [`the`](/api/core/function/the/) functions.
 *
 * @param options
 *
 * @group Questions
 */
export function descriptionText(options: DescriptionOptions): (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>) => string
export function descriptionText(templates: TemplateStringsArray, ...parameters: Array<Answerable<any>>): string
export function descriptionText(...args: any[]): any {
    return isPlainObject(args[0])
        ? (templates: TemplateStringsArray, ...parameters: Array<Answerable<any>>) =>
            templateToString(templates, parameters, parameterDescriptionText(args[0]))
        : templateToString(args[0], args.slice(1), parameterDescriptionText({ maxLength: 50 }));
}

export function templateToString(templates: TemplateStringsArray, parameters: Array<Answerable<any>>, describer: (parameter: any) => string = _ => _): string {
    return templates.flatMap((template, i) =>
        i < parameters.length
            ? [ template, describer(parameters[i]) ]
            : [ template ],
    ).join('');
}

/**
 * Produces a human-readable description of the parameter.
 * This function is used internally by [`descriptionText`](/api/core/function/descriptionText/).
 *
 * @param options
 *
 * @group Questions
 */
export function parameterDescriptionText(options: DescriptionOptions): (parameter: any) => string {
    const maxLength = ensure('options.maxLength', options.maxLength, isGreaterThanOrEqualTo(10));
    const trim = trimTo(maxLength);

    return function describeParameter(parameter: any): string {
        if (parameter === null) {
            return 'null';
        }
        if (parameter === undefined) {
            return 'undefined';
        }
        if (typeof parameter === 'string') {
            return `"${ trim(parameter) }"`;
        }
        if (typeof parameter === 'symbol') {
            return `Symbol(${ trim(parameter.description) })`;
        }
        if (typeof parameter === 'bigint') {
            return `${ trim(parameter.toString()) }`;
        }
        if (isAPromise(parameter)) {
            return 'Promise';
        }
        if (Array.isArray(parameter)) {
            return `[ ${ trim(parameter.map(item => describeParameter(item)).join(', ')) } ]`;
        }
        if (parameter instanceof Map) {
            return `Map(${ describeParameter(Object.fromEntries(parameter.entries())) })`;
        }
        if (parameter instanceof Set) {
            return `Set(${ describeParameter(Array.from(parameter.values())) })`;
        }
        if (isADate(parameter)) {
            return `Date(${ parameter.toISOString() })`;
        }
        if (parameter instanceof RegExp) {
            return `${ parameter }`;
        }
        // if (parameter instanceof Masked) {
        //     return `${ parameter }`;
        // }
        if (hasItsOwnToString(parameter)) {
            return `${ trim(parameter.toString()) }`;
        }
        if (isPlainObject(parameter)) {
            const stringifiedEntries = Object
                .entries(parameter)
                .reduce((acc, [ key, value ]) => acc.concat(`${ key }: ${ describeParameter(value) }`), [])
                .join(', ');

            return `{ ${ trim(stringifiedEntries) } }`;
        }
        if (typeof parameter === 'object') {
            const entries = significantFieldsOf(parameter)
                .map(field => [ field, (parameter as any)[field] ]);
            return `${ parameter.constructor.name }(${ describeParameter(Object.fromEntries(entries)) })`;
        }
        return `${ parameter }`;
    };
}

function trimTo(maxLength: number): (value: string) => string {
    const ellipsis = '...';
    return (value: string) => {
        const oneLiner = value.replaceAll(/\n+/g, ' ');
        return oneLiner.length > maxLength
            ? `${ oneLiner.slice(0, Math.max(0, maxLength)) }${ ellipsis }`
            : value;
    };
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
 * Checks if the value is a {@apilink Date}
 *
 * @param v
 */
function isADate(v: Answerable<any>): v is Date {
    return v instanceof Date;
}

/**
 * Checks if the value defines its own `toString` method
 *
 * @param v
 */
function hasItsOwnToString(v: Answerable<any>): v is { toString: () => string } {
    return typeof v === 'object'
        && !!(v as any).toString
        && typeof (v as any).toString === 'function'
        && !isNative((v as any).toString);
}

/**
 * Inspired by https://davidwalsh.name/detect-native-function
 *
 * @param v
 */
function isNative(v: any): v is Function {  // eslint-disable-line @typescript-eslint/ban-types

    const
        toString = Object.prototype.toString,    // Used to resolve the internal `{@apilink Class}` of values
        fnToString = Function.prototype.toString,  // Used to resolve the decompiled source of functions
        hostConstructor = /^\[object .+?Constructor]$/; // Used to detect host constructors (Safari > 4; really typed array specific)

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    const nativeFunctionTemplate = new RegExp(
        '^' +
        // Coerce `Object#toString` to a string
        String(toString)
            // Escape any special regexp characters
            .replaceAll(/[$()*+./?[\\\]^{|}]/g, '\\$&')
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replaceAll(/toString|(function).*?(?=\\\()| for .+?(?=\\])/g, '$1.*?') +
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
