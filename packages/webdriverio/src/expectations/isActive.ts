import { Expectation } from '@serenity-js/core';
import { Element } from 'webdriverio';

import { ElementExpectation } from './ElementExpectation';

/**
 * @desc
 *  Expectation that the element is active (has focus).
 *  If the selector matches multiple elements, it will return true if one of the elements has focus.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isFocused/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isActive(): Expectation<boolean, Element<'async'>> {
    return ElementExpectation.forElementTo('become active', actual => actual.isFocused());
}

