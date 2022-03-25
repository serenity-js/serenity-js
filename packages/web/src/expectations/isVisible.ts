import { Expectation } from '@serenity-js/core';

import { PageElement } from '../screenplay';
import { ElementExpectation } from './ElementExpectation';

/**
 * @desc
 *  Expectation that the element is present in the DOM of the page and:
 *  - is not hidden, so doesn't have `display: none`, `visibility: hidden` or `opacity: 0`
 *  - is within the browser viewport
 *  - doesn't have its centre covered by other elements
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isDisplayed/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isVisible(): Expectation<PageElement> {
    return ElementExpectation.forElementTo('become visible', actual => actual.isVisible());
}
