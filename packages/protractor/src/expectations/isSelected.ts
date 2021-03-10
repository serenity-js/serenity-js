import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { ElementFinderExpectation } from './ElementFinderExpectation';
import { isPresent } from './isPresent';

/**
 * @desc
 *  Expectation that the element is present and selected
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<boolean, ElementFinder>}
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
