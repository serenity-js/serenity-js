import { match } from 'tiny-types';

import { CalculatorCommand, CalculatorEvent, CalculatorQuery, EnterOperandCommand, GetCalculationResult, OperandEntered, OperatorUsed, ResultCalculator, UseOperatorCommand } from './domain';

export class Calculator {
    constructor(private readonly events: Array<CalculatorEvent<any>> = []) {
    }

    execute(command: CalculatorCommand<any>): void {
        match(command)
            .when(EnterOperandCommand, ({ value, calculationId }: EnterOperandCommand) => this.events.push(new OperandEntered(value, calculationId)))
            .when(UseOperatorCommand,  ({ value, calculationId }: UseOperatorCommand)  => this.events.push(new OperatorUsed(value, calculationId)))
            .else(_ => {
                throw new Error('Command not recognised');
            });
    }

    submit(query: GetCalculationResult): number;
    submit(query: CalculatorQuery) {
        return match(query)
            .when(GetCalculationResult, ({ calculationId }) => {
                return new ResultCalculator().process(
                    this.events.filter(event => event.calculationId.equals(calculationId)),
                ).value;
            })
            .else(_ => {
                throw new Error('Query not recognised');
            });
    }
}
