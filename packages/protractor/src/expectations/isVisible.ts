import { Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { combined } from './combined';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present in the DOM of the page and visible.
 *
 * @returns {Expectation<boolean, ElementFinder>}
 */
export function isVisible(): Expectation<boolean, ElementFinder> {
    return combined('become visible', isPresent(), isDisplayed());
}

function isDisplayed(): Expectation<boolean, ElementFinder> {
    return ElementFinderExpectation.to('become displayed', actual => actual.isDisplayed());
}
