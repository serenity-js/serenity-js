import { CalculationId, Operator } from '../model';
import { CalculatorCommand } from './CalculatorCommand';

export class UseOperatorCommand extends CalculatorCommand<Operator> {
    constructor(value: Operator, calculationId: CalculationId) {
        super(value, calculationId);
    }
}
