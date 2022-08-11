import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { PageElement } from '../screenplay';
import { ElementExpectation } from './ElementExpectation';

/**
 * {@link Expectation} that an element is "active", which means it resolves to `true` when:
 *  - the element {@link isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isActive} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isActive}
 * - {@link ElementExpectation}
 * - {@link Expectation}
 * - {@link Check}
 * - {@link Ensure}
 * - {@link Wait}
 *
 * @group Expectations
 */
export function isActive(): Expectation<PageElement> {
    return Expectation.to<boolean, PageElement>('become active').soThatActual(and(
        isPresent(),
        ElementExpectation.forElementTo('become active', actual => actual.isActive()),
    ));
}
