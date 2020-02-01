import { and, Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present and selected
 *
 * @returns {Expectation<boolean, ElementFinder>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions~Check}
 * @see {@link Wait}
 */
export function isSelected(): Expectation<any, ElementFinder> {
    return Expectation.to<ElementFinder>('become selected').soThatActual(and(
        isPresent(),
        ElementFinderExpectation.forElementTo('become selected', actual => actual.isSelected()),
    ));
}
