import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../../abilities';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';
import { TargetNestedElement } from './TargetNestedElement';

/**
 * @desc
 *  Locates a single web element.
 *  Instead of using this class directly, please use {@link Target.the} instead.
 *
 * @public
 * @see {@link Target}
 */
export class TargetElement
    extends Question<ElementFinder>
    implements RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    /**
     * @desc
     *
     * @param {string} description - A human-readable description to be used in the report
     * @param {protractor~Locator} locator - A locator to be used when locating the element
     */
    constructor(
        protected readonly description: string,
        protected readonly locator: Locator,
    ) {
        super(`the ${ description }`);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @returns {TargetNestedElement}
     */
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
        return override(
            BrowseTheWeb.as(actor).locate(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }
}
