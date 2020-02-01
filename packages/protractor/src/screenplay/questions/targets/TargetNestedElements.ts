import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';

/**
 * @public
 */
export class TargetNestedElements
    implements Question<ElementArrayFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{

    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly children: Question<ElementArrayFinder> | ElementArrayFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElements(parent, this);
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
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return withAnswerOf<ElementFinder, ElementArrayFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementArrayFinder, ElementArrayFinder>(actor, this.children, children => override(
                parent.all(children.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    /**
     * Description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Question}.
     */
    toString() {
        return `${ this.children.toString() } of ${ this.parent }`;
    }
}
