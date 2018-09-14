import { Operator } from '../model';
import { CalculatorEvent } from './CalculatorEvent';

export class OperatorUsed extends CalculatorEvent<Operator> {
}
