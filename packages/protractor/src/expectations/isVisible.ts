import { and, Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present in the DOM of the page and visible.
 *
 * @returns {Expectation<boolean, ElementFinder>}
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
