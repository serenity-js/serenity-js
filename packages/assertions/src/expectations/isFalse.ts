import { Expectation } from '../Expectation';

export function isFalse() {
  return Expectation.thatActualShould<boolean, boolean>(`have value that is`, false)
    .soThat((actualValue, expectedValueAlwaysFalse) => actualValue === expectedValueAlwaysFalse);
};
