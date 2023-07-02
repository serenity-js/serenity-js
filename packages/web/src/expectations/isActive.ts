import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementActive = Expectation.define(
    'isActive', 'become active',
    (actual: PageElement) => actual.isActive(),
);

/**
 * {@apilink Expectation} that an element is "active", which means it resolves to `true` when:
 *  - the element {@apilink isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isActive} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isActive}
 * - {@apilink Expectation}
 * - {@apilink Check}
 * - {@apilink Ensure}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export function isActive(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become active').soThatActual(and(
        isPresent(),
        isElementActive(),
    ));
}
