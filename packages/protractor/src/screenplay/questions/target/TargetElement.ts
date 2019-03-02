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

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return override(
            BrowseTheWeb.as(actor).locate(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.description }`;
    }
}
