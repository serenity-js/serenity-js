import { and, Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { isEnabled } from './isEnabled';
import { isVisible } from './isVisible';

/**
 * @desc
 *  Expectation that the element is visible and enabled, and therefore clickable
 *
 * @returns {Expectation<boolean, ElementFinder>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions~Check}
 * @see {@link Wait}
 */
export function isClickable(): Expectation<any, ElementFinder> {
    return Expectation.to<ElementFinder>('become clickable').soThatActual(and(isVisible(), isEnabled()));
}
