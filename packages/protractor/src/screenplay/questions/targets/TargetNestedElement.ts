import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../../withAnswerOf';
import { override } from './override';

/**
 * @desc
 *  Locates a single {@link WebElement} located within another {@link WebElement}.
 *
 *  Instead of using this class directly, please use {@link Target.the} and {@link TargetElement#of} instead.
 *
 * @public
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class TargetNestedElement
    extends Question<ElementFinder>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{

    /**
     * @desc
     *
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @param {Question<ElementFinder> | ElementFinder} child
     */
    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly child: Question<ElementFinder> | ElementFinder,
    ) {
        super(`${ child.toString() } of ${ parent }`);
    }

    /**
     * @desc
     *  Retrieves a {@link WebElement} located by `locator`,
     *  resolved in the context of a `parent` {@link WebElement}.
     *
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @returns {TargetNestedElement}
     *
     * @see {@link Target}
     */
    of(parent: Question<ElementFinder> | ElementFinder): TargetNestedElement {
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
}
