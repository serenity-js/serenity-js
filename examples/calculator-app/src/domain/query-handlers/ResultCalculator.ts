import { match } from 'tiny-types';

import { CalculatorEvent, OperandEntered, OperatorUsed } from '../events';
import { AdditionOperator, ArithmeticOperator, DivisionOperator, LeftParenthesisOperator, MultiplicationOperator, Operand, Operator, RightParenthesisOperator, SubtractionOperator } from '../model';
import { QueryHandler } from './QueryHandler';

export class ResultCalculator implements QueryHandler<Operand> {

    process(events: Array<CalculatorEvent<any>>): Operand {
        if (events.length === 0) {
            return new Operand(0);
        }

        const operatorsAndOperands = events.map(event => match<CalculatorEvent<any>, Operand | Operator>(event)
            .when(OperandEntered, ({ value }: OperandEntered) => value)
            .when(OperatorUsed,   ({ value }: OperatorUsed)   => value)
            .else(_ => void 0),
        ).filter(event => !! event);

        return this.calculate(this.toPostfix(operatorsAndOperands));
    }

    /**
     * Converts a list of in-fixed operators and operands to a post-fixed version using the Shunting yard algorithm.
     *
     * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
     *
     * @param infixed
     * @returns postfixed
     */
    private toPostfix(infixed: Array<Operator | Operand>): Array<ArithmeticOperator | Operand> {
        // http://wcipeg.com/wiki/Shunting_yard_algorithm/foo.hs
        const operatorPrecedence = {
            [AdditionOperator.Symbol]: 1,
            [SubtractionOperator.Symbol]: 1,
            [MultiplicationOperator.Symbol]: 2,
            [DivisionOperator.Symbol]: 2,
        };

        // eslint-disable-next-line unicorn/consistent-function-scoping
        const peek = <T>(list: T[]): T => list[list.length - 1];

        const stack: Array<Operator | Operand> = [];

        return infixed.reduce((output: Array<Operator | Operand>, current: Operator | Operand) => {
            if (current instanceof Operand) {
                output.push(current);
            }

            if (current instanceof Operator && current.value in operatorPrecedence) {
                while (peek(stack) && peek(stack).value in operatorPrecedence && operatorPrecedence[current.value] <= operatorPrecedence[peek(stack).value]) {
                    output.push(stack.pop());
                }

                stack.push(current);
            }

            if (current instanceof LeftParenthesisOperator) {
                stack.push(current);
            }

            if (current instanceof RightParenthesisOperator) {
                while (! peek(stack).equals(new LeftParenthesisOperator())) {
                    output.push(stack.pop());
                }

                stack.pop();
            }

            return output;
        }, []).concat(stack.reverse()) as Array<ArithmeticOperator | Operand>;
    }

    /**
     * Calculates the result using the Reverse Polish Notation algorithm
     *
     * @see https://en.wikipedia.org/wiki/Reverse_Polish_notation
     * @param postfixed
     */
    private calculate(postfixed: Array<ArithmeticOperator | Operand>): Operand {
        const stack: Operand[] = [];

        postfixed.forEach(current => {
            if (current instanceof ArithmeticOperator) {
                const computed = current.apply(stack.splice(-2, 1)[0], stack.pop());
                stack.push(computed);
            }
            else {
                stack.push(current);
            }
        });

        return stack[0];
    }
}
