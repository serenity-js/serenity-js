import { ensure, isDefined, isNumber, TinyType } from 'tiny-types';

export class Operand extends TinyType {
    constructor(public readonly value: number) {
        super();
        ensure(Operand.name, value, isDefined(), isNumber());
    }
}
