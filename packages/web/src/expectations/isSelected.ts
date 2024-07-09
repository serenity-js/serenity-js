import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import type { PageElement } from '../screenplay';

const isElementSelected = Expectation.define(
    'isSelected', 'become selected',
    (actual: PageElement) => actual.isSelected(),
);

/**
 *  [`Expectation`](https://serenity-js.org/api/core/class/Expectation/) that an `<option>` or `<input>` element is selected, which means it resolves to `true` when:
 *  - the element [is present](https://serenity-js.org/api/assertions/function/isPresent/) in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - [`PageElement.isSelected`](https://serenity-js.org/api/web/class/PageElement/#isSelected) resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - [`PageElement.isSelected`](https://serenity-js.org/api/web/class/PageElement/#isSelected)
 * - [`Expectation`](https://serenity-js.org/api/core/class/Expectation/)
 * - [`Check`](https://serenity-js.org/api/core/class/Check/)
 * - [`Ensure`](https://serenity-js.org/api/assertions/class/Ensure/)
 * - [`Wait`](https://serenity-js.org/api/core/class/Wait/)
 *
 * @group Expectations
 */
export function isSelected(): Expectation<PageElement> {
    return Expectation.to<PageElement>('become selected').soThatActual(and(
        isPresent(),
        isElementSelected(),
    ));
}
