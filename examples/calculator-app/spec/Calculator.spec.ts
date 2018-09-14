import 'mocha';

import { Calculator } from '../src';
import {
    AdditionOperator,
    CalculationId,
    DivisionOperator,
    EnterOperand,
    GetCalculationResult,
    LeftParenthesisOperator,
    MultiplicationOperator,
    Operand,
    RightParenthesisOperator,
    SubtractionOperator,
    UseOperator,
} from '../src/domain';

import { expect } from './expect';

describe('Calculator', () => {

    describe('when processing the expression', () => {
        it('should produce a result of 0 when no operation has been performed yet', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(0);
        });

        it('should add two numbers', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(4);
        });

        it('should subtract one number from another', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(3), calculationId));
            calculator.execute(new UseOperator(new SubtractionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(1);
        });

        it('should multiply one number by another', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(3), calculationId));
            calculator.execute(new UseOperator(new MultiplicationOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(6);
        });

        it('should divide one number by another', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(6), calculationId));
            calculator.execute(new UseOperator(new DivisionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(3), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(2);
        });

        it('should take the operator precedence into consideration', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new MultiplicationOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(8);
        });

        it('should take parentheses into consideration', () => {
            const calculator = new Calculator();
            const calculationId  = CalculationId.create();

            calculator.execute(new UseOperator(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(2), calculationId));
            calculator.execute(new UseOperator(new RightParenthesisOperator(), calculationId));

            calculator.execute(new UseOperator(new MultiplicationOperator(), calculationId));

            calculator.execute(new UseOperator(new LeftParenthesisOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(3), calculationId));
            calculator.execute(new UseOperator(new AdditionOperator(), calculationId));
            calculator.execute(new EnterOperand(new Operand(5), calculationId));
            calculator.execute(new UseOperator(new RightParenthesisOperator(), calculationId));

            expect(calculator.submit(new GetCalculationResult(calculationId))).to.equal(32);
        });
    });

    describe('when supporting multiple parallel calculations', () => {

        it('maintains separate state for every calculation', () => {
            const calculator = new Calculator();
            const first  = CalculationId.create();
            const second  = CalculationId.create();

            calculator.execute(new EnterOperand(new Operand(2), first));
            calculator.execute(new EnterOperand(new Operand(3), second));
            calculator.execute(new UseOperator(new AdditionOperator(), first));
            calculator.execute(new UseOperator(new MultiplicationOperator(), second));
            calculator.execute(new EnterOperand(new Operand(4), first));
            calculator.execute(new EnterOperand(new Operand(5), second));

            expect(calculator.submit(new GetCalculationResult(first))).to.equal(6);
            expect(calculator.submit(new GetCalculationResult(second))).to.equal(15);
        });
    });

    describe('when dealing with invalid input', () => {

        it('ignores commands it cannot execute', () => {
            const calculator = new Calculator();

            expect(() => calculator.execute(null)).to.not.throw;    // tslint:disable-line:no-unused-expression
            expect(calculator.execute(null)).to.be.undefined;       // tslint:disable-line:no-unused-expression
        });

        it('ignores the queries it cannot process', () => {
            const calculator = new Calculator();

            expect(() => calculator.submit(null)).to.not.throw;     // tslint:disable-line:no-unused-expression
            expect(calculator.submit(null)).to.be.undefined;        // tslint:disable-line:no-unused-expression
        });
    });
});
