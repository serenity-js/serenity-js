import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present in the DOM of the page and visible.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, ElementFinder>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions~Check}
 * @see {@link Wait}
 */
export function isVisible(): Expectation<any, ElementFinder> {
    return Expectation.to<ElementFinder>('become visible').soThatActual(and(
        isPresent(),
        isDisplayed(),
    ));
}

function isDisplayed(): Expectation<any, ElementFinder> {
    return ElementFinderExpectation.forElementTo('become displayed', actual => actual.isDisplayed());
}
