import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementEnabled = Expectation.define(
    'isEnabled', 'become enabled',
    (actual: PageElement) => actual.isEnabled(),
);

/**
 *  [`Expectation`](https://serenity-js.org/api/core/class/Expectation/) that an element is enabled, which means it resolves to `true` when:
 *  - the element [is present](https://serenity-js.org/api/assertions/function/isPresent/) in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - [`PageElement.isEnabled`](https://serenity-js.org/api/web/class/PageElement/#isEnabled) resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - [`PageElement.isEnabled`](https://serenity-js.org/api/web/class/PageElement/#isEnabled)
 * - [`Expectation`](https://serenity-js.org/api/core/class/Expectation/)
 * - [`Check`](https://serenity-js.org/api/core/class/Check/)
 * - [`Ensure`](https://serenity-js.org/api/assertions/class/Ensure/)
 * - [`Wait`](https://serenity-js.org/api/core/class/Wait/)
 *
 * @group Expectations
 */
export function isEnabled(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become enabled').soThatActual(and(
        isPresent(),
        isElementEnabled(),
    ));
}
