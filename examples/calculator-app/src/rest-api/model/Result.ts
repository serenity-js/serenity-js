import { ensure, isDefined, isNumber, JSONObject, TinyType } from 'tiny-types';

import { Expression } from './Expression';

export class Result extends TinyType {
    static fromJSON(o: JSONObject): Result {
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
