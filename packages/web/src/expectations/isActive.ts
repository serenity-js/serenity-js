import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { PageElement } from '../screenplay';
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
 * @see {@link @serenity-js/core/lib/screenplay/interactions~Wait}
 */
export function isActive(): Expectation<PageElement> {
    return Expectation.to<boolean, PageElement>('become active').soThatActual(and(
        isPresent(),
        ElementExpectation.forElementTo('become active', actual => actual.isActive()),
    ));
}
