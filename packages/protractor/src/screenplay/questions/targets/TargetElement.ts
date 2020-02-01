import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../../abilities';
import { RelativeQuestion } from '../RelativeQuestion';
import { override } from './override';
import { TargetNestedElement } from './TargetNestedElement';

/**
 * @public
 */
export class TargetElement
    implements Question<ElementFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    constructor(
        protected readonly description: string,
        protected readonly locator: Locator,
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
        return override(
            BrowseTheWeb.as(actor).locate(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    /**
     * Description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Question}.
     */
    toString() {
        return `the ${ this.description }`;
    }
}
