import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';

/**
 * @public
 */
export class TargetNestedElement
    implements Question<ElementFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly child: Question<ElementFinder> | ElementFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElement(parent, this);
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
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return withAnswerOf<ElementFinder, ElementFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementFinder, ElementFinder>(actor, this.child, child => override(
                parent.element(child.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    /**
     * Description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Question}.
     */
    toString() {
        return `${ this.child.toString() } of ${ this.parent }`;
    }
}
