import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { Element } from '../ui';
import { ElementExpectation } from './ElementExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present in the DOM of the page and visible.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, Element<'async'>>}
 *
 * @see https://webdriver.io/docs/api/element/isDisplayed/
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isVisible(): Expectation<boolean, Element> {
    return Expectation.to<Element>('become visible').soThatActual(and(
        isPresent(),
        isDisplayed(),
    ));
}

function isDisplayed(): Expectation<any, Element> {
    return ElementExpectation.forElementTo('become displayed', actual => actual.isDisplayed());
}
