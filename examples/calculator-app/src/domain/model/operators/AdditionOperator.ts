import { Operand } from '../Operand';
import { ArithmeticOperator } from './ArithmeticOperator';

export class AdditionOperator extends ArithmeticOperator {
    static Symbol = '+';

    constructor() {
        super(AdditionOperator.Symbol);
    }

    apply(left: Operand, right: Operand): Operand {
        return new Operand(left.value + right.value);
    }
}
