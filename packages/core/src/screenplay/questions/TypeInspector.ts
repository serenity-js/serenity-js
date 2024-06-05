export class TypeInspector {
    static isPromise(value: unknown): value is Promise<unknown> {
        return value instanceof Promise
            || (value !== null && typeof value === 'object' && typeof value['then'] === 'function');
    }

    static isDate(value: unknown): value is Date {
        return value instanceof Date;
    }

    /**
     * Checks if the value defines its own `toString` method
     *
     * @param value
     */
    static hasItsOwnToString(value: unknown): boolean {
        return typeof value === 'object'
            && !! (value as any).toString
            && typeof (value as any).toString === 'function'
            && ! TypeInspector.isNative((value as any).toString);
    }

    /**
     * Inspired by https://davidwalsh.name/detect-native-function
     *
     * @param value
     */
    static isNative(value: unknown): value is Function {  // eslint-disable-line @typescript-eslint/ban-types

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

        const type = typeof value;
        return type === 'function'
            // Use `Function#toString` to bypass the value's own `toString` method
            // and avoid being faked out.
            ? nativeFunctionTemplate.test(fnToString.call(value))
            // Fallback to a host object check because some environments will represent
            // things like typed arrays as DOM methods which may not conform to the
            // normal native pattern.
            : (value && type === 'object' && hostConstructor.test(toString.call(value))) || false;
    }
}
