import { Operator } from '../Operator';

export class LeftParenthesisOperator extends Operator {
    static Symbol = '(';

    constructor() {
        super(LeftParenthesisOperator.Symbol);
    }
}
