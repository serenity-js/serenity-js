/* eslint-disable unicorn/consistent-function-scoping */
// todo: instead of manually including isPlainObject, each script from web/lib/scripts should be pre-built and included in the global browser scope
export function rehydrate(...result: [ { argsCount: number; refsCount: number }, ...any[] ]): Array<any> {
    function isPlainObject(v: unknown): v is object {   // eslint-disable-line @typescript-eslint/ban-types
        if (typeof v === 'object' && v !== null) {
            if (typeof Object.getPrototypeOf === 'function') {
                const proto = Object.getPrototypeOf(v);
                return proto === Object.prototype || proto === null;
            }
            return Object.prototype.toString.call(v) === '[object Object]';
        }
        return false;
    }

    function rehydrateRecursively(arg: any, refs: any[]): any {
        if (Array.isArray(arg)) {
            return arg.map(item => rehydrateRecursively(item, refs));
        }
        if (isPlainObject(arg)) {
            return Object.fromEntries(
                Object.entries(arg)
                    .map(([ key, value ]) => [ key, rehydrateRecursively(value, refs) ])
            );
        }
        if (typeof arg === 'string' && arg.startsWith('$ref')) {
            return refs[Number.parseInt(arg.replace('$ref', ''), 10)];
        }

        return arg;
    }

    const [ { argsCount }, ...items ] = result;

    const args = items.slice(0, argsCount);
    const refs = items.slice(argsCount);

    return args.map(arg => rehydrateRecursively(arg, refs));
}
