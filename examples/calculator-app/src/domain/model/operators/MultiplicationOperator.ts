import { Operand } from '../Operand';
import { ArithmeticOperator } from './ArithmeticOperator';

export class MultiplicationOperator extends ArithmeticOperator {
    static Symbol = '*';

    constructor() {
        super(MultiplicationOperator.Symbol);
    }

    apply(left: Operand, right: Operand): Operand {
        return new Operand(left.value * right.value);
    }
}
