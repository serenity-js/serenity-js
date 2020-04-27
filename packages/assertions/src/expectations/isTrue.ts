import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function isTrue(): Expectation<boolean> {
  return Expectation.thatActualShould<boolean, boolean>(`have value that is `, true)
    .soThat((actualValue, expectedValueAlwaysTrue) => actualValue === expectedValueAlwaysTrue);
}