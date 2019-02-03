import { Expectation } from '@serenity-js/assertions';
import { ElementFinder } from 'protractor';
import { combined } from './combined';
import { isEnabled } from './isEnabled';
import { isVisible } from './isVisible';

/**
 * @desc
 *  Expectation that the element is visible and enabled, and therefore clickable
 *
 * @returns {Expectation<boolean, ElementFinder>}
 */
export function isClickable(): Expectation<boolean, ElementFinder> {
    return combined('become clickable', isVisible(), isEnabled());
}
