import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementVisible = Expectation.define(
    'isVisible', 'become visible',
    (actual: PageElement) => actual.isVisible(),
);

/**
 *  {@apilink Expectation} that an element is visible, which means it resolves to `true` when:
 *  - the element {@apilink isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isVisible} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isVisible}
 * - {@apilink Expectation}
 * - {@apilink Check}
 * - {@apilink Ensure}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export function isVisible(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become visible').soThatActual(and(
        isPresent(),
        isElementVisible(),
    ));
}
