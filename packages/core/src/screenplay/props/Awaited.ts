/**
 * @desc
 *  Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 *  Back-ported from TypeScript 4.5.
 *
 * @see https://github.com/microsoft/TypeScript/blob/feac9eb126e56837d16acb61cd019ce8520db76c/src/lib/es5.d.ts#L1492-L1501
 */
export type Awaited<T> =
    T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
        T extends object & { then(onfulfilled: infer F): any } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
            F extends ((value: infer V) => any) ? // if the argument to `then` is callable, extracts the argument
                Awaited<V> : // recursively unwrap the value
                never : // the argument to `then` was not callable
            T; // non-object or non-thenable
