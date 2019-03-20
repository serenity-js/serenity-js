import { Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';

/**
 * @desc
 *  Expectation that the element is present in the DOM of a page.
 *  Please note that this does not necessarily mean that the element is visible.
 *
 * @returns {Expectation<boolean, ElementFinder>}
 */
export function isPresent(): Expectation<boolean, ElementFinder> {
    return ElementFinderExpectation.to('become present', actual => actual.isPresent());
}
