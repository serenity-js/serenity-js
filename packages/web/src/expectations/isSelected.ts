import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementSelected = Expectation.define(
    'isSelected', 'become selected',
    (actual: PageElement) => actual.isSelected(),
);

/**
 *  {@apilink Expectation} that an `<option>` or `<input>` element is selected, which means it resolves to `true` when:
 *  - the element {@apilink isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isSelected} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isSelected}
 * - {@apilink Expectation}
 * - {@apilink Check}
 * - {@apilink Ensure}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export function isSelected(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become selected').soThatActual(and(
        isPresent(),
        isElementSelected(),
    ));
}
