import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Calculator } from '../src';
import {
    AdditionOperator,
    CalculationId,
    CalculatorCommand,
    CalculatorQuery,
    DivisionOperator,
    EnterOperandCommand,
    GetCalculationResult,
    LeftParenthesisOperator,
    MultiplicationOperator,
    Operand,
    RightParenthesisOperator,
    SubtractionOperator,
    UseOperatorCommand,
} from '../src/domain';
import { expect } from './expect';

describe('Calculator', () => {

    describe('when processing the expression', () => {
        it('should produce a result of 0 when no operation has been performed yet: nil = 0', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(0);
        });

        it(`should produce a result that's equal to the operand when the operand is the only thing that's been provided: 2 = 2`, () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(2);
        });

        it('should add two numbers: 2 + 2 = 4', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(4);
        });

        it('should subtract one number from another: 3 - 2 = 1', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(3), calculationId));
            calculator.execute(new UseOperatorCommand(new SubtractionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(1);
        });

        it('should multiply one number by another: 3 * 2 = 6', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(3), calculationId));
            calculator.execute(new UseOperatorCommand(new MultiplicationOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(6);
        });

        it('should divide one number by another: 5 / 2 = 2.5', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(5), calculationId));
            calculator.execute(new UseOperatorCommand(new DivisionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(2.5);
        });

        it('should take the arithmetic operator precedence into consideration: 2 + 2 * 2 + 2 = 8', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new MultiplicationOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(8);
        });

        it('should take parentheses into consideration: (2 + 2) * (3 + 5) = 32', () => {
            const calculator = new Calculator();
            const calculationId = CalculationId.create();

            calculator.execute(new UseOperatorCommand(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new RightParenthesisOperator(), calculationId));

            calculator.execute(new UseOperatorCommand(new MultiplicationOperator(), calculationId));

            calculator.execute(new UseOperatorCommand(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(3), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(5), calculationId));
            calculator.execute(new UseOperatorCommand(new RightParenthesisOperator(), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(32);
        });

        it('should correctly recognise unary operators: -(-2-(+2)) = 4', () => {
            const calculator = new Calculator();
            const calculationId = CalculationId.create();

            calculator.execute(new UseOperatorCommand(new SubtractionOperator(), calculationId));
            calculator.execute(new UseOperatorCommand(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new UseOperatorCommand(new SubtractionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new SubtractionOperator(), calculationId));
            calculator.execute(new UseOperatorCommand(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperandCommand(new Operand(2), calculationId));
            calculator.execute(new UseOperatorCommand(new RightParenthesisOperator(), calculationId));
            calculator.execute(new UseOperatorCommand(new RightParenthesisOperator(), calculationId));
        });
    });

    describe('when supporting multiple parallel calculations', () => {

        it('maintains separate state for every expression', () => {
            const calculator = new Calculator();
            const first  = CalculationId.create();
            const second  = CalculationId.create();

            calculator.execute(new EnterOperandCommand(new Operand(2), first));
            calculator.execute(new EnterOperandCommand(new Operand(3), second));
            calculator.execute(new UseOperatorCommand(new AdditionOperator(), first));
            calculator.execute(new UseOperatorCommand(new MultiplicationOperator(), second));
            calculator.execute(new EnterOperandCommand(new Operand(4), first));
            calculator.execute(new EnterOperandCommand(new Operand(5), second));

            expect(calculator.submit(new GetCalculationResult(first))).to.equal(6);
            expect(calculator.submit(new GetCalculationResult(second))).to.equal(15);
        });
    });

    describe('when dealing with invalid input', () => {

        class UnsuportedCommand extends CalculatorCommand<object> {
            constructor() {
                super({}, CalculationId.create());
            }
        }

        given<any>(
            null,   // eslint-disable-line unicorn/no-null
            undefined,
            {},
            'string',
            1,
            false,
            new UnsuportedCommand(),
        ).
        it('complains when it receives a command it cannot execute', (command: any) => {
            const calculator = new Calculator();

            expect(() => calculator.execute(command)).to.throw(Error, 'Command not recognised');
        });

        class UnsuportedQuery extends CalculatorQuery {
            constructor() {
                super(CalculationId.create());
            }
        }

        given<any>(
            null,   // eslint-disable-line unicorn/no-null
            undefined,
            {},
            'string',
            1,
            false,
            new UnsuportedQuery(),
        ).
        it('complains when it receives a query it cannot process', (query: any) => {
            const calculator = new Calculator();

            expect(() => calculator.submit(query)).to.throw(Error, 'Query not recognised');
        });
    });
});
