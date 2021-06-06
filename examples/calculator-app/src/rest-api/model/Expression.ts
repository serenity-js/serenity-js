import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

import { Operand, Operator } from '../../domain/model';

export class Expression extends TinyType {
    static fromString(expression: string): Expression {
        const parser = new ExpressionStringParser();

        return new Expression(parser.parse(expression));
    }

    constructor(public readonly tokens: Array<Operator | Operand>) {
        super();
        ensure(Expression.name, tokens, isDefined());
    }
}

class ExpressionStringParser {
    parse(expression: string): Array<Operator | Operand> {
        ensure('expression', expression, isDefined(), property('length', isGreaterThan(0)));

        const
            parsedNumber = new ParserBuffer(),
            characters   = expression.replace(/\s+/g, '').split(''),
            tokens       = [];

        characters.forEach(char => {
            switch (true) {
                case this.isPartOfANumber(char):
                    parsedNumber.append(char);
                    break;
                case this.isOperator(char):
                    if (! parsedNumber.isEmpty()) {
                        tokens.push(parsedNumber.flushAs(Operand.fromString));
                    }
                    tokens.push(Operator.fromString(char));
                    break;
                default:
                    throw new Error(`Invalid character at position ${ expression.indexOf(char) }`);
            }
        });

        if (! parsedNumber.isEmpty()) {
            tokens.push(parsedNumber.flushAs(Operand.fromString));
        }

        return tokens;
    }

    private isPartOfANumber(char: string): boolean {
        return /[\d.]/.test(char);
    }

    private isOperator(char: string): boolean {
        return Operator.fromString(char) !== undefined;
    }
}

class ParserBuffer {
    constructor(private buffer: string = '') {
    }

    isEmpty(): boolean {
        return this.buffer === '';
    }

    append(character: string) {
        this.buffer = this.buffer + character;
    }

    flushAs<T>(mapper: (buffer: string) => T) {
        const value = mapper(this.buffer);

        this.buffer = '';

        return value;
    }
}
