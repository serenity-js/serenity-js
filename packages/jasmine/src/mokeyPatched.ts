import { ErrorStackParser } from '@serenity-js/core/lib/io';

const parser = new ErrorStackParser();

/**
 * @desc
 *  Monkey-patches Jasmine domain model constructors so that they
 *  record information about the file system location of the caller function.
 *
 *  This helps to make reporting more accurate.
 *
 * @param jasmineConstructor - A Jasmine constructor function to be patched
 */
export function monkeyPatched(jasmineConstructor: any) {
    const result = function MonkeyPatched(attrs: object) {
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

/**
 * @desc
 *  Retrieves the file system location of the caller function.
 *
 * @package
 */
function callerLocation() {
    const caller = parser.parse(new Error()).filter(frame => ! /node_modules/.test(frame.fileName))[2];
    return {
        path: caller.fileName,
        line: caller.lineNumber,
        column: caller.columnNumber,
    };
}

/**
 * @desc
 *  Checks if a given property is likely to be a static method or a static field on the constructor function.
 *
 * @param {string} property - name of the property to be checked
 *
 * @package
 */
function isAStaticProperty(property: string) {
    return ! ~['length', 'name', 'arguments', 'caller', 'prototype'].indexOf(property);
}
