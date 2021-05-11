/* eslint-disable @typescript-eslint/no-unused-vars,unicorn/better-regex,unicorn/escape-case,no-useless-escape,no-control-regex,@typescript-eslint/explicit-module-boundary-types */
import { JSONValue } from 'tiny-types';

// Based on work of Douglas Crockford
//  https://github.com/jan-molak/JSON-js/blob/master/cycle.js

/**
 * @desc
 *  Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 *  Supports objects with cyclic references.
 *
 * @param {any} value
 *  A JavaScript value, usually an object or array, to be converted.
 *
 * @param {function(this: any, key: string, value: any): any} [replacer]
 *  A function that transforms the results.
 *
 * @param {string | number} [space]
 *  Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 */
export function stringify(value: unknown, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string {
    return JSON.stringify(decycle(value), replacer, space);
}

/**
 * @desc
 *  Converts a JavaScript Object Notation (JSON) string into an object.
 *  Supports objects with cyclic references.
 *
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results. This function is called for each member of the object.
 *   If a member contains nested objects, the nested objects are transformed before the parent object is.
 */
export function parse(text: string, reviver?: (this: any, key: string, value: any) => any) {
    return retrocycle(JSON.parse(text, reviver));
}

/**
 * @desc
 *  Makes a deep copy of an object or array, assuring that there is at most
 *  one instance of each object or array in the resulting structure. The
 *  duplicate references (which might be forming cycles) are replaced with
 *  an object of the form:
 *
 *  ```
 *      {"$ref": PATH}
 *  ```
 *
 *  where the PATH is a JSONPath string that locates the first occurrence.
 *
 *  So,
 *  ```
 *      var a = [];
 *      a[0] = a;
 *      return JSON.stringify(decycle(a));
 *  ```
 *
 *  produces the string `[{"$ref":"$"}]`.
 *
 *  JSONPath is used to locate the unique object. $ indicates the top level of
 *  the object or array. [NUMBER] or [STRING] indicates a child element or property.
 *
 *  Based on work by Douglas Crockford
 *   https://github.com/jan-molak/JSON-js/blob/master/cycle.js
 *
 * @param {any} object
 *
 * @package
 */
function decycle(object: any) {
    const objects = new WeakMap<any, string>();     // object to path mappings

    // The derez function recurses through the object, producing a deep copy
    return (function derez(value, path) {

        let old_path,   // The path of an earlier occurance of value
            nu;         // The new object or array

        if (
            typeof value === 'object'
            && value !== null
            && !(value instanceof Boolean)
            && !(value instanceof Date)
            && !(value instanceof Number)
            && !(value instanceof RegExp)
            && !(value instanceof String)
        ) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object.

            old_path = objects.get(value);
            if (old_path !== undefined) {
                return { $ref: old_path };
            }
            // Otherwise, accumulate the unique value and its path.

            objects.set(value, path);

            // If it is an array, replicate the array.

            if (Array.isArray(value)) {
                nu = [];
                value.forEach(function (element, i) {
                    nu[i] = derez(element, path + '[' + i + ']');
                });
            } else {

                // If it is an object, replicate the object.

                nu = {};
                Object.keys(value).forEach(function (name) {
                    nu[name] = derez(
                        value[name],
                        path + '[' + JSON.stringify(name) + ']'
                    );
                });
            }
            return nu;
        }
        return value;
    }(object, '$'));
}

/**
 * @desc
 *  Restore an object that was reduced by decycle. Members which values are
 *  objects of the form
 *  ```
 *       {$ref: PATH}
 *  ```
 *  are replaced with references to the value found by the PATH.
 *  This will restore cycles. The object will be MUTATED.
 *
 *  The eval function is used to locate the values described by a PATH. The
 *  root object is kept in a $ variable. A regular expression is used to
 *  assure that the PATH is extremely well formed. The regexp contains nested
 *  * quantifiers. That has been known to have extremely bad performance
 *  problems on some browsers for very long strings. A PATH is expected to be
 *  reasonably short. A PATH is allowed to belong to a very restricted subset of
 *  Goessner's JSONPath.
 *
 *  So,
 *  ```
 *       var s = '[{"$ref":"$"}]';
 *       return retrocycle(JSON.parse(s));
 *  ```
 *  produces an array containing a single element which is the array itself.
 *
 *  Based on work by Douglas Crockford
 *   https://github.com/jan-molak/JSON-js/blob/master/cycle.js
 *
 * @param {any} $
 *
 * @package
 */
function retrocycle($: any) {
    const px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

    (function rez(value) {

        // The rez function walks recursively through the object looking for $ref
        // properties. When it finds one that has a value that is a path, then it
        // replaces the $ref object with a reference to the value that is found by
        // the path.

        if (value && typeof value === 'object') {
            if (Array.isArray(value)) {
                value.forEach(function (element, i) {
                    if (typeof element === 'object' && element !== null) {
                        const path = element.$ref;
                        if (typeof path === 'string' && px.test(path)) {
                            value[i] = eval(path);
                        } else {
                            rez(element);
                        }
                    }
                });
            } else {
                Object.keys(value).forEach(function (name) {
                    const item = value[name];
                    if (typeof item === 'object' && item !== null) {
                        const path = item.$ref;
                        if (typeof path === 'string' && px.test(path)) {
                            value[name] = eval(path);
                        } else {
                            rez(item);
                        }
                    }
                });
            }
        }
    }($));

    return $;
}
