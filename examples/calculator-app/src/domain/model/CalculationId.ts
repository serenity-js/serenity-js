import { createId } from '@paralleldrive/cuid2';
import { ensure, isDefined, isString, TinyType } from 'tiny-types';

export class CalculationId extends TinyType {
    static create() {
        return new CalculationId(createId());
    }

    constructor(public readonly value: string) {
        super();
        ensure(CalculationId.name, value, isDefined(), isString());
    }
}
