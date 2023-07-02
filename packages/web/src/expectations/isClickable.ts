import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementClickable = Expectation.define(
    'isClickable', 'become clickable',
    (actual: PageElement) => actual.isClickable(),
);

/**
 *  {@apilink Expectation} that an element is clickable, which means it resolves to `true` when:
 *  - the element {@apilink isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isClickable} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isClickable}
 * - {@apilink Expectation}
 * - {@apilink Check}
 * - {@apilink Ensure}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export function isClickable(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become clickable').soThatActual(and(
        isPresent(),
        isElementClickable(),
    ));
}
