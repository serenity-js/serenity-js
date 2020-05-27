import { Expectation } from '../Expectation';

export function isTrue() {
  return Expectation.thatActualShould<boolean, boolean>(`have value that is`, true)
  .soThat((actualValue, expectedValueAlwaysTrue) => actualValue === expectedValueAlwaysTrue);
};
