import { Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects';

/**
 * Produces an [expectation](https://serenity-js.org/api/core/class/Expectation/) that is met when the actual array of `Item[]` contains
 * at least one `Item` that is equal to the resolved value of `expected`.
 *
 * Note that the equality check performs comparison **by value**
 * using [TinyTypes `equal`](https://github.com/jan-molak/tiny-types/blob/master/src/objects/equal.ts).
 *
 * ## Ensuring that the array contains the given item
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, and, startsWith, endsWith } from '@serenity-js/assertions'
 *
 * const items = [ { name: 'apples' }, { name: 'bananas' } ]
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that(items, contain({ name: 'bananas' })),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export const contain = Expectation.define(
    'contain', 'contain',
    <Item>(actual: Item[], expected: Item) =>
        actual.some(item => equal(item, expected))
);
