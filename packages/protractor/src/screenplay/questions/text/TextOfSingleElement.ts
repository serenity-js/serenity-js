import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';

import { withAnswerOf } from '../../withAnswerOf';
import { TargetNestedElement } from '../targets';

/**
 * @package
 */
export class TextOfSingleElement
    extends Question<Promise<string>>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    constructor(protected readonly target: Question<ElementFinder> | ElementFinder) {
        super(`the text of ${ target }`);
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new TextOfSingleElement(new TargetNestedElement(parent, this.target));
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
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return withAnswerOf(actor, this.target, elf => elf.getText() as any);
    }
}
