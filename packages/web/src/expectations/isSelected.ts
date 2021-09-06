import { Expectation } from '@serenity-js/core';

import { UIElement } from '../ui';
import { ElementExpectation } from './ElementExpectation';

/**
 * @desc
 *  Expectation that an `<option>` or `<input>` element of type checkbox or radio is currently selected.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isSelected/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isSelected(): Expectation<boolean, UIElement> {
    return ElementExpectation.forElementTo('become selected', actual => actual.isSelected());
}
