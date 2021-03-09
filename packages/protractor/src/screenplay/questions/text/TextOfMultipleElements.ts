import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';

import { withAnswerOf } from '../../withAnswerOf';
import { TargetNestedElements } from '../targets';

/**
 * @package
 */
export class TextOfMultipleElements
    extends Question<Promise<string[]>>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
{
    constructor(protected readonly target: Question<ElementArrayFinder> | ElementArrayFinder) {
        super(`the text of ${ target }`);
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new TextOfMultipleElements(new TargetNestedElements(parent, this.target));
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {

        // protractor ignores type definitions for the ElementArrayFinder, hence the `any`
        // https://github.com/angular/protractor/blob/c3978ec166760ac07db01e700c4aaaa19d9b5c38/lib/element.ts#L92
        return withAnswerOf(actor, this.target, eaf => Promise.resolve(eaf.getText() as any) as Promise<string[]>);
    }
}
