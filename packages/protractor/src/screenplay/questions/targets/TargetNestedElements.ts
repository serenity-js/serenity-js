import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { override } from './override';

/**
 * @desc
 *  Locates a group of web element located within another web element.
 *  Instead of using this class directly, please use {@link Target.all} instead.
 *
 * @public
 * @see {@link Target}
 */
export class TargetNestedElements
    extends Question<ElementArrayFinder>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{

    /**
     * @desc
     *
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @param {Question<ElementArrayFinder> | ElementArrayFinder} children
     */
    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly children: Question<ElementArrayFinder> | ElementArrayFinder,
    ) {
        super(`${ children.toString() } of ${ parent }`);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @returns {TargetNestedElements}
     */
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
}
