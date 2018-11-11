import { ensure, isDefined, isNumber, Serialised, TinyType } from 'tiny-types';
import { Expression } from './Expression';

export class Result extends TinyType {
    fromJSON(o: Serialised<Result>): Result {
        return new Result(
            Expression.fromString(o.expression as string),
            o.value as number,
        );
    }

    constructor(public readonly expression: Expression, public readonly value: number) {
        super();
        ensure(Expression.name, expression, isDefined());
        ensure('Result value', value, isDefined(), isNumber());
    }
}
