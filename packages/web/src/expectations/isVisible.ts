import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementVisible = Expectation.define(
    'isVisible', 'become visible',
    (actual: PageElement) => actual.isVisible(),
);

/**
 *  [`Expectation`](https://serenity-js.org/api/core/class/Expectation/) that an element is visible, which means it resolves to `true` when:
 *  - the element [is present](https://serenity-js.org/api/assertions/function/isPresent/) in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - [`PageElement.isVisible`](https://serenity-js.org/api/web/class/PageElement/#isVisible) resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - [`PageElement.isVisible`](https://serenity-js.org/api/web/class/PageElement/#isVisible)
 * - [`Expectation`](https://serenity-js.org/api/core/class/Expectation/)
 * - [`Check`](https://serenity-js.org/api/core/class/Check/)
 * - [`Ensure`](https://serenity-js.org/api/assertions/class/Ensure/)
 * - [`Wait`](https://serenity-js.org/api/core/class/Wait/)
 *
 * @group Expectations
 */
export function isVisible(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become visible').soThatActual(and(
        isPresent(),
        isElementVisible(),
    ));
}
