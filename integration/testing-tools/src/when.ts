export function when(condition: boolean) {
    const it = (global as any).test || (global as any).it;

    if (! it) {
        throw new Error('`when` must be used in a Mocha test, e.g. when(condition).it(...)');
    }

    const noop = Object.assign(
        (..._args: unknown[]) => {},
        { only: (..._args: unknown[]) => {}, skip: (..._args: unknown[]) => {} },
    );

    return {
        it: condition ? it : noop,
    }
}
