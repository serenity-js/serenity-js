import { match } from 'tiny-types';
import {
    CalculatorCommand,
    CalculatorEvent,
    CalculatorQuery,
    EnterOperand,
    GetCalculationResult,
    OperandEntered,
    OperatorUsed,
    ResultCalculator,
    UseOperator,
} from './domain';

export class Calculator {
    constructor(private readonly events: Array<CalculatorEvent<any>> = []) {
    }

    execute(command: CalculatorCommand<any>): void {
        match(command)
            .when(EnterOperand, ({ value, calculationId }: EnterOperand) => this.events.push(new OperandEntered(value, calculationId)))
            .when(UseOperator,  ({ value, calculationId }: UseOperator)  => this.events.push(new OperatorUsed(value, calculationId)))
            .else(_ => /* ignore */ void 0);
    }

    submit(query: GetCalculationResult): number;
    submit(query: CalculatorQuery) {
        return match(query)
            .when(GetCalculationResult, ({ calculationId }) => {
                return new ResultCalculator().process(
                    this.events.filter(event => event.calculationId.equals(calculationId)),
                ).value;
            })
            .else(_ => void 0);
    }
}
