import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementActive = Expectation.define(
    'isActive', 'become active',
    (actual: PageElement) => actual.isActive(),
);

/**
 * [`Expectation`](https://serenity-js.org/api/core/class/Expectation/) that an element is "active", which means it resolves to `true` when:
 *  - the element [is present](https://serenity-js.org/api/assertions/function/isPresent/) in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - [`PageElement.isActive`](https://serenity-js.org/api/web/class/PageElement/#isActive) resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - [`PageElement.isActive`](https://serenity-js.org/api/web/class/PageElement/#isActive)
 * - [`Expectation`](https://serenity-js.org/api/core/class/Expectation/)
 * - [`Check`](https://serenity-js.org/api/core/class/Check/)
 * - [`Ensure`](https://serenity-js.org/api/assertions/class/Ensure/)
 * - [`Wait`](https://serenity-js.org/api/core/class/Wait/)
 *
 * @group Expectations
 */
export function isActive(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become active').soThatActual(and(
        isPresent(),
        isElementActive(),
    ));
}
