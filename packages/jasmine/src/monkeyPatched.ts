import { ErrorStackParser } from '@serenity-js/core/lib/errors/index.js';

const parser = new ErrorStackParser();

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * Monkey-patches Jasmine domain model constructors so that they
 * record information about the file system location of the caller function.
 *
 * This helps to make reporting more accurate.
 *
 * @param jasmineConstructor - A Jasmine constructor function to be patched
 * @param {object} wrappers - Attributes to wrap when the monkey-patched Jasmine constructor is invoked
 */
export function monkeyPatched(
    jasmineConstructor: any,
    wrappers: {[key: string]: (original: (attrs: object) => any) => (attrs: object) => any} = {},
) {
    const result = function MonkeyPatched(attrs: object) {
        Object.keys(wrappers).forEach(key => {
            attrs[key] = wrappers[key](attrs[key]);
        });

        const instance = new jasmineConstructor(attrs);
        instance.result.location = callerLocation();

        return instance;
    };

    Object.getOwnPropertyNames(jasmineConstructor)
        .filter(isAStaticProperty)
        .forEach(property => {
            result[property] = jasmineConstructor[property];
        });

    return result;
}

// eslint-enable

/**
 * Retrieves the file system location of the caller function.
 *
 * @package
 */
function callerLocation() {
    const frames = parser.parse(new Error('fake error'));

    const found = frames
        .filter(frame => ! /(node_modules)/.test(frame.fileName))
        .find(frame => /^(Suite|Object|Proxy)/.test(frame.functionName) || ! frame.functionName);

    const caller = found || { fileName: 'unknown', lineNumber: 0, columnNumber: 0 };

    return {
        path: caller.fileName,
        line: caller.lineNumber,
        column: caller.columnNumber,
    };
}

/**
 * Checks if a given property is likely to be a static method or a static field on the constructor function.
 *
 * @package
 */
function isAStaticProperty(property: string) {
    return ! ~['length', 'name', 'arguments', 'caller', 'prototype'].indexOf(property);
}
