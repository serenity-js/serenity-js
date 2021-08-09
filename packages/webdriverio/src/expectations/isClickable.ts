import { Expectation } from '@serenity-js/core';
import { Element } from 'webdriverio';

import { ElementExpectation } from './ElementExpectation';

/**
 * @desc
 *  Expectation that an element is clickable, which means:
 *  - it exists
 *  - it is visible
 *  - it is within viewport (if not, try to scroll to it)
 *  - its center is not overlapped with another element
 *  - it is not disabled
 *  otherwise return false.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isClickable/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isClickable(): Expectation<boolean, Element<'async'>> {
    return ElementExpectation.forElementTo('become clickable', actual => actual.isClickable());
}

