import { ensure, hasLengthOf, isDefined, isString, TinyType } from 'tiny-types';

export abstract class Operator extends TinyType {
    protected constructor(public readonly value: string) {
        super();
        ensure(Operator.name, value, isDefined(), isString(), hasLengthOf(1));
    }
}
