import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';
import { equals } from '.';

/**
 * 
 *     -#actor ensures that true does be true
 *     +#actor ensures that true does have value that is true
 * 
 *      fron Ensure
 *      return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
 *          this.actual = true
 *          this.expectation = 'be true' vs 'have a value that is true'
 */

// export function isTrue() {
//   return Expectation.to(`be true`)
//     .soThatActual(equals(true))
// }

export function isTrue() {
  return Expectation.to(`have value that is`)
    .soThatActual(equals(true))
}
