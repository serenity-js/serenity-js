import { CalculationId, Operand } from '../model';
import { CalculatorCommand } from './CalculatorCommand';

export class EnterOperand extends CalculatorCommand<Operand> {
    constructor(value: Operand, calculationId: CalculationId) {
        super(value, calculationId);
    }
}
