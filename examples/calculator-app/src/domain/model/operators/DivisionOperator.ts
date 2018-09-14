import { Operand } from '../Operand';
import { ArithmeticOperator } from './ArithmeticOperator';

export class DivisionOperator extends ArithmeticOperator {
    static Symbol = '/';

    constructor() {
        super(DivisionOperator.Symbol);
    }

    apply(left: Operand, right: Operand): Operand {
        return new Operand(left.value / right.value);
    }
}
