import { Expectation } from '@serenity-js/core';

import { UIElement } from '../ui';
import { ElementExpectation } from './ElementExpectation';

/**
 * @desc
 *  Expectation that the element is enabled.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isEnabled/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isEnabled(): Expectation<boolean, UIElement> {
    return ElementExpectation.forElementTo('become enabled', actual => actual.isEnabled());
}
