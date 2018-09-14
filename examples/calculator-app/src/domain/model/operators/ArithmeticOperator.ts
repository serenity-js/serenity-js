import { Operand } from '../Operand';
import { Operator } from '../Operator';

export abstract class ArithmeticOperator extends Operator {
    abstract apply(left: Operand, right: Operand): Operand;
}
