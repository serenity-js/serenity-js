import { Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';

/**
 * @desc
 *  Expectation that the element is enabled.
 *
 * @returns {Expectation<boolean, ElementFinder>}
 */
export function isEnabled(): Expectation<boolean, ElementFinder> {
    return ElementFinderExpectation.to('become enabled', actual => actual.isEnabled());
}
