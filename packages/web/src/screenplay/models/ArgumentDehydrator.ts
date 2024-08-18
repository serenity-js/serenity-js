import { ValueInspector } from '@serenity-js/core/lib/io';

/* eslint-disable @typescript-eslint/indent */
type TransformedArgument<T, U> =
    T extends Array<infer E> ? Array<TransformedArgument<E, U>> :
    T extends object ? { [K in keyof T]: TransformedArgument<T[K], U> }
    : U;
/* eslint-enable */

type RefId = `$ref${number}`;

/**
 * @group Models
 */
export class ArgumentDehydrator<T, U> {
    constructor(
        private readonly shouldReference: (item: any) => item is T,
        private readonly transformation: (item: T) => U | Promise<U>,
    ) {
    }

    public async dehydrate(inputArgs: Array<any>): Promise<[ { argsCount: number, refsCount: number}, ...any[] ]> {
        const result = await this.dehydrateRecursively(inputArgs);

        return [
            { argsCount: result.args.length, refsCount: result.refsCount },
            ...result.args,
            ...result.refs
        ];
    }

    private async dehydrateRecursively(inputArgs: Array<any>, refsCount = 0): Promise<{
        args: Array<TransformedArgument<T, RefId>>;
        refs: Array<U>;
        refsCount: number;
    }> {
        return inputArgs.reduce(async (acc, arg) => {
            const { args, refs, refsCount } = await acc;

            if (Array.isArray(arg)) {
                const { args: nestedArgs, refs: nestedRefs, refsCount: currentRefsCount } = await this.dehydrateRecursively(arg, refsCount);
                return {
                    args: [ ...args, nestedArgs, ],
                    refs: [ ...refs, ...nestedRefs ],
                    refsCount: currentRefsCount,
                };
            }

            if (ValueInspector.isPlainObject(arg)) {
                const { args: nestedArgs, refs: nestedRefs, refsCount: currentRefsCount } = await this.dehydrateRecursively(Object.values(arg), refsCount);
                return {
                    args: [ ...args, Object.fromEntries(Object.keys(arg).map((key, i) => [ key, nestedArgs[i] ])) ],
                    refs: [ ...refs, ...nestedRefs ],
                    refsCount: currentRefsCount,
                };
            }

            return this.shouldReference(arg)
                ? { args: [ ...args, `$ref${ refsCount }` ], refs: [ ...refs, await this.transformation(arg) ], refsCount: refsCount + 1 }
                : { args: [ ...args, arg ], refs, refsCount };
        }, Promise.resolve({ args: [], refs: [], refsCount }));
    }
}
