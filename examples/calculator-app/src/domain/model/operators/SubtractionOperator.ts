import { Operand } from '../Operand';
import { ArithmeticOperator } from './ArithmeticOperator';

export class SubtractionOperator extends ArithmeticOperator {
    static Symbol = '-';

    constructor() {
        super(SubtractionOperator.Symbol);
    }

    apply(left: Operand, right: Operand): Operand {
        return new Operand(left.value - right.value);
    }
}
