import { Question } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { RelativeQuestion } from '../RelativeQuestion';
import { TargetElement } from './TargetElement';
import { TargetElements } from './TargetElements';
import { TargetNestedElement } from './TargetNestedElement';
import { TargetNestedElements } from './TargetNestedElements';

/**
 * @public
 */
export class Target  {
    static the(name: string) {
        return {
            located: (byLocator: Locator): Question<ElementFinder> & RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder> =>
                new TargetElement(name, byLocator),

            of: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator): Question<ElementFinder> & RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder> =>
                        new TargetNestedElement(parent, new TargetElement(name, byLocator)),
                };
            },
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator): Question<ElementArrayFinder> & RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder> =>
                new TargetElements(name, byLocator),

            of: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator) =>
                        new TargetNestedElements(parent, new TargetElements(name, byLocator)),
                };
            },
        };
    }
}
