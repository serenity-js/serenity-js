import { Question } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { RelativeQuestion } from '../RelativeQuestion';
import { TextOfMultipleElements } from './TextOfMultipleElements';
import { TextOfSingleElement } from './TextOfSingleElement';

/**
 * @public
 */
export class Text {

    static of(target: Question<ElementFinder> | ElementFinder):
        Question<Promise<string>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
    {
        return new TextOfSingleElement(target);
    }

    static ofAll(target: Question<ElementArrayFinder> | ElementArrayFinder):
        Question<Promise<string[]>> & RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
    {
        return new TextOfMultipleElements(target);
    }
}
