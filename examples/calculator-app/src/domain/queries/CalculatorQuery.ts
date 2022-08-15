import { ensure, isDefined, TinyType } from 'tiny-types';

import { CalculationId } from '../model';

export abstract class CalculatorQuery extends TinyType {
    constructor(
        public readonly calculationId: CalculationId,
    ) {
        super();
        ensure(CalculatorQuery.name, calculationId, isDefined());
    }
}
