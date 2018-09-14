import { CalculatorEvent } from '../events';

export interface QueryHandler<R> {
    process(events: Array<CalculatorEvent<any>>): R;
}
