import { CalculationId, Operator } from '../model';
import { CalculatorCommand } from './CalculatorCommand';

export class UseOperator extends CalculatorCommand<Operator> {
    constructor(value: Operator, calculationId: CalculationId) {
        super(value, calculationId);
    }
}
