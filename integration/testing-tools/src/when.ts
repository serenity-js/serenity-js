// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function when(condition: boolean) {
    const it = (global as any).test || (global as any).it;

    if (! it) {
        throw new Error('`when` must be used in a Mocha test, e.g. when(condition).it(...)');
    }

    return {
        it: condition ? it : it.skip,
    }
}
