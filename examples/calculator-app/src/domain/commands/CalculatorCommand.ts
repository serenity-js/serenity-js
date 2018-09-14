import { ensure, isDefined, TinyType } from 'tiny-types';

import { CalculationId } from '../model';

export abstract class CalculatorCommand<T> extends TinyType {
    protected constructor(
        public readonly value: T,
        public readonly calculationId: CalculationId,
    ) {
        super();
        ensure('value', value, isDefined());
        ensure('calculationId', calculationId, isDefined());
    }
}
