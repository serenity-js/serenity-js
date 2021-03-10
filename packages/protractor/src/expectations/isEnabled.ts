import { Expectation } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';

/**
 * @desc
 *  Expectation that the element is enabled.
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, ElementFinder>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions~Check}
 * @see {@link Wait}
 */
export function isEnabled(): Expectation<boolean, ElementFinder> {
    return ElementFinderExpectation.forElementTo('become enabled', actual => actual.isEnabled());
}
