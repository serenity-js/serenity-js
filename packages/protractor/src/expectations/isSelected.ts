import { Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { combined } from './combined';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present and selected
 *
 * @returns {Expectation<boolean, ElementFinder>}
 */
export function isSelected(): Expectation<boolean, ElementFinder> {
    return combined('become selected', isPresent(), ElementFinderExpectation.to('become selected', actual => actual.isSelected()));
}
