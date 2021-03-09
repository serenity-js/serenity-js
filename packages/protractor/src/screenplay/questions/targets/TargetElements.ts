import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../../abilities';
import { override } from './override';
import { TargetNestedElements } from './TargetNestedElements';

/**
 * @desc
 *  Locates a group of web element.
 *  Instead of using this class directly, please use {@link Target.all} instead.
 *
 * @public
 * @see {@link Target}
 */
export class TargetElements
    extends Question<ElementArrayFinder>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{

    /**
     * @desc
     *
     * @param {string} description - A human-readable description to be used in the report
     * @param {protractor~Locator} locator - A locator to be used when locating the element
     */
    constructor(
        private readonly description: string,
        private readonly locator: Locator,
    ) {
        super(`the ${ description }`);
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
        return override(
            BrowseTheWeb.as(actor).locateAll(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }
}
