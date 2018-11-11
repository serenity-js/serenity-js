import { ensure, isDefined, isNumber, TinyType } from 'tiny-types';

export class Operand extends TinyType {
    static fromString(characters: string): Operand {
        return !! ~characters.indexOf('.')
            ? new Operand(parseFloat(characters))
            : new Operand(parseInt(characters, 10));
    }

    constructor(public readonly value: number) {
        super();
        ensure(Operand.name, value, isDefined(), isNumber());
    }
}
