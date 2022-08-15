import { ensure, isDefined, TinyType } from 'tiny-types';

import { CalculationId } from '../model';

export abstract class CalculatorEvent<T> extends TinyType {
    constructor(
        public readonly value: T,
        public readonly calculationId: CalculationId,
        public readonly timestamp: Date = new Date(),
    ) {
        super();
        ensure('value', value, isDefined());
        ensure('calculationId', calculationId, isDefined());
        ensure('timestamp', timestamp, isDefined());
    }
}
