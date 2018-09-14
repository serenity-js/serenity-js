import { Operator } from '../Operator';

export class RightParenthesisOperator extends Operator {
    static Symbol = ')';

    constructor() {
        super(RightParenthesisOperator.Symbol);
    }
}
