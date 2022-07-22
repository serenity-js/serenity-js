import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { PageElement } from '../screenplay';
import { ElementExpectation } from './ElementExpectation';
import { isVisible } from './isVisible';

/**
 * @desc
 *  Expectation that the element is enabled.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isEnabled/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link @serenity-js/core/lib/screenplay/interactions~Wait}
 */
export function isEnabled(): Expectation<PageElement> {
    return Expectation.to<boolean, PageElement>('become enabled').soThatActual(and(
        isPresent(),
        ElementExpectation.forElementTo('become enabled', actual => actual.isEnabled())
    ));
}
