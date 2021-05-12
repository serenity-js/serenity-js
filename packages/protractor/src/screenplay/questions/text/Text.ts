import { MetaQuestion, Question } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { TextOfMultipleElements } from './TextOfMultipleElements';
import { TextOfSingleElement } from './TextOfSingleElement';

/**
 * @desc
 *  Resolves to the visible (i.e. not hidden by CSS) `innerText` of:
 *  - a given {@link WebElement}, represented by {@link ElementFinder} or `Question<ElementFinder>`,
 *  - a group of {@link WebElement}s, represented by {@link ElementArrayFinder} or `Question<ElementArrayFinder>`.
 *
 *  The result includes the visible text of any sub-elements, without any leading or trailing whitespace.
 *
 * @public
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Text {

    /**
     * @desc
     *  Retrieves text of a single {@link WebElement},
     *  represented by {@link ElementFinder}
     *  or `Question<ElementFinder>`.
     *
     * @param {Question<ElementFinder> | ElementFinder} target
     * @returns {Question<Promise<string>> & MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static of(target: Question<ElementFinder> | ElementFinder):
        Question<Promise<string>> & MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>  // eslint-disable-line @typescript-eslint/indent
    {
        return new TextOfSingleElement(target);
    }

    /**
     * @desc
     *  Retrieves text of a group of {@link WebElement}s,
     *  represented by {@link ElementArrayFinder}
     *  or `Question<ElementArrayFinder>`
     *
     * @param {Question<ElementArrayFinder> | ElementArrayFinder} target
     * @returns {Question<Promise<string[]>> & MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static ofAll(target: Question<ElementArrayFinder> | ElementArrayFinder):
        Question<Promise<string[]>> & MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>  // eslint-disable-line @typescript-eslint/indent
    {
        return new TextOfMultipleElements(target);
    }
}
