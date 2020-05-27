import { Expectation } from '../Expectation';
import { equals } from './equals';

export function isTrue(): Expectation<boolean> {
    return Expectation.to<boolean>(`equal true`).soThatActual(equals(true));
}
